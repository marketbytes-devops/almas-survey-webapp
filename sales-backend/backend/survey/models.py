from django.db import models
from authapp.models import CustomUser
from contact.models import Enquiry

class SurveyEnquiry(models.Model):
    enquiry = models.ForeignKey(Enquiry, on_delete=models.CASCADE, related_name='survey_enquiries')
    assigned = models.BooleanField(default=False, null=True, blank=True)
    salesperson = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': 'sales'})
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['assigned']),
        ]

    def __str__(self):
        return f"SurveyEnquiry for {self.enquiry.fullName} ({self.enquiry.id})"