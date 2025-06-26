from django.db import models
from django.contrib.postgres.fields import ArrayField
from accounts.models import User
from django.utils import timezone
import json

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')
    start_date = models.DateField()
    end_date = models.DateField()
    duration_hours = models.IntegerField()
    #languages = ArrayField(models.CharField(max_length=50), blank=True, default=list)
    languages = models.TextField(blank=True, default='[]')  # Store JSON string
    cohort_number = models.IntegerField(default=1)
    course_picture = models.ImageField(upload_to='course_pics/', null=True, blank=True)
    slots_total = models.IntegerField()
    slots_booked = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} (Cohort {self.cohort_number})"

    def get_languages(self):
        return json.loads(self.languages)

    def set_languages(self, lang_list):
        self.languages = json.dumps(lang_list)

    def is_full(self):
        return self.slots_booked >= self.slots_total

    def save(self, *args, **kwargs):
        # Auto-increment cohort ONLY if end date has passed AND we're updating an existing course
        if self.pk and self.end_date < timezone.now().date():
            self.cohort_number += 1
            self.start_date = None
            self.end_date = None
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']
