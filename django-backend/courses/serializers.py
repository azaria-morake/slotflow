from rest_framework import serializers
from .models import Course
from accounts.models import User
from django.utils import timezone
import json

class CourseSerializer(serializers.ModelSerializer):
    # Handle languages as a list in the API, even though it's stored as a JSON string
    languages = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=True
    )
    instructor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_admin=True),
        default=serializers.CurrentUserDefault()
    )
    is_full = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'instructor', 'start_date', 'end_date',
            'duration_hours', 'languages', 'cohort_number', 'course_picture',
            'slots_total', 'slots_booked', 'is_active', 'is_full', 'created_at'
        ]
        read_only_fields = ['slots_booked', 'cohort_number', 'created_at', 'is_active']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        try:
            rep['languages'] = json.loads(instance.languages)
        except (TypeError, json.JSONDecodeError):
            rep['languages'] = []
        return rep

    def to_internal_value(self, data):
        internal = super().to_internal_value(data)
        internal['languages'] = json.dumps(internal['languages'])  # Convert list to JSON string
        return internal

    def validate(self, data):
        errors = {}
        now = timezone.now().date()
        
        start_date = data.get('start_date', self.instance.start_date if self.instance else None)
        end_date = data.get('end_date', self.instance.end_date if self.instance else None)

        if start_date and end_date:
            if start_date >= end_date:
                errors['end_date'] = ["End date must be after start date"]
            if not self.instance and start_date < now:
                errors['start_date'] = ["Start date cannot be in the past"]

        slots_total = data.get('slots_total', self.instance.slots_total if self.instance else None)
        if slots_total is not None and slots_total <= 0:
            errors['slots_total'] = ["Must have at least 1 slot"]

        if errors:
            raise serializers.ValidationError(errors)

        return data
