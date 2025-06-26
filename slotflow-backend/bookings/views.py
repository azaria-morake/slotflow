from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Booking
from .serializers import BookingSerializer, CancelBookingSerializer
from courses.models import Course
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string

class BookingListView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(learner=self.request.user)

    def perform_create(self, serializer):
        booking = serializer.save()
        self.send_booking_email(booking)

    def send_booking_email(self, booking):
        subject = f"Booking Confirmation: {booking.course.title}"
        recipient = booking.learner.email
        
        # Send to admin
        admin_subject = f"New Booking: {booking.learner.username} for {booking.course.title}"
        admin_recipient = booking.course.instructor.email
        
        context = {
            'course': booking.course,
            'user': booking.learner,
            'booking_date': booking.booked_at
        }
        
        # Learner email
        send_mail(
            subject,
            render_to_string('emails/booking_confirmation.txt', context),
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            html_message=render_to_string('emails/booking_confirmation.html', context)
        )
        
        # Admin email
        send_mail(
            admin_subject,
            render_to_string('emails/admin_booking_notification.txt', context),
            settings.DEFAULT_FROM_EMAIL,
            [admin_recipient],
            html_message=render_to_string('emails/admin_booking_notification.html', context)
        )

class CancelBookingView(generics.GenericAPIView):
    queryset = Booking.objects.all()
    serializer_class = CancelBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        booking = self.get_object()
        
        # Verify ownership
        if booking.learner != request.user:
            return Response(
                {"detail": "Not your booking to cancel"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verify not already cancelled
        if booking.is_cancelled:
            return Response(
                {"detail": "Booking already cancelled"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        booking.cancel()
        self.send_cancellation_email(booking)
        
        return Response(
            {"detail": "Booking cancelled successfully"},
            status=status.HTTP_200_OK
        )

    def send_cancellation_email(self, booking):
        subject = f"Booking Cancelled: {booking.course.title}"
        recipient = booking.learner.email
        
        # Send to admin
        admin_subject = f"Booking Cancelled: {booking.learner.username} for {booking.course.title}"
        admin_recipient = booking.course.instructor.email
        
        context = {
            'course': booking.course,
            'user': booking.learner,
            'cancellation_date': booking.cancelled_at
        }
        
        # Learner email
        send_mail(
            subject,
            render_to_string('emails/cancellation_confirmation.txt', context),
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            html_message=render_to_string('emails/cancellation_confirmation.html', context)
        )
        
        # Admin email
        send_mail(
            admin_subject,
            render_to_string('emails/admin_cancellation_notification.txt', context),
            settings.DEFAULT_FROM_EMAIL,
            [admin_recipient],
            html_message=render_to_string('emails/admin_cancellation_notification.html', context)
        )
