from rest_framework import serializers
from .models import Booking
from courses.models import Course
from accounts.models import User
from django.utils import timezone

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'id', 'course', 'learner', 'booked_at',
            'is_cancelled', 'cancelled_at'
        ]
        read_only_fields = [
            'id', 'learner', 'booked_at',
            'is_cancelled', 'cancelled_at'
        ]

    def validate_course(self, value):
        # Check course is active
        if not value.is_active:
            raise serializers.ValidationError("Course is not active")
        
        # Check course has available slots
        if value.is_full():
            raise serializers.ValidationError("Course is full")
        
        return value

    def validate(self, data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            # Check for existing active booking
            existing_booking = Booking.objects.filter(
                course=data['course'],
                learner=request.user,
                is_cancelled=False
            ).exists()
            
            if existing_booking:
                raise serializers.ValidationError(
                    "You already have an active booking for this course"
                )
        
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['learner'] = request.user
        
        return super().create(validated_data)

class CancelBookingSerializer(serializers.Serializer):
    confirm = serializers.BooleanField(required=True)

    def validate_confirm(self, value):
        if not value:
            raise serializers.ValidationError("Must confirm cancellation")
        return value
