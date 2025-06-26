from django.db import models
from django.core.exceptions import ValidationError
from accounts.models import User
from courses.models import Course
from django.utils import timezone

class Booking(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='bookings')
    learner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    booked_at = models.DateTimeField(auto_now_add=True)
    is_cancelled = models.BooleanField(default=False)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['course', 'learner']
        ordering = ['-booked_at']

    def __str__(self):
        return f"{self.learner.username} -> {self.course.title}"

    def clean(self):
        # Prevent booking inactive courses
        if not self.course.is_active:
            raise ValidationError("Cannot book an inactive course")
        
        # Prevent booking full courses
        if self.course.is_full():
            raise ValidationError("Course is full")
        
        # Prevent duplicate active bookings
        if not self.pk and Booking.objects.filter(
            course=self.course,
            learner=self.learner,
            is_cancelled=False
        ).exists():
            raise ValidationError("You already have an active booking for this course")

    def save(self, *args, **kwargs):
        self.full_clean()
        
        # Update slots booked count
        if not self.pk:  # New booking
            self.course.slots_booked += 1
            self.course.save()
        elif self.is_cancelled and not self.cancelled_at:  # First cancellation
            self.course.slots_booked -= 1
            self.course.save()
            self.cancelled_at = timezone.now()
            
        super().save(*args, **kwargs)

    def cancel(self):
        if not self.is_cancelled:
            self.is_cancelled = True
            self.save()
