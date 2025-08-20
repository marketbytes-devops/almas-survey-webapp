from django.db import models
from authapp.models import CustomUser

class Enquiry(models.Model):
    """
    Model to store enquiry form submissions.
    """
    fullName = models.CharField(max_length=100)
    phoneNumber = models.CharField(max_length=20)
    email = models.EmailField()
    serviceType = models.CharField(max_length=50)
    message = models.TextField()
    recaptchaToken = models.TextField()
    refererUrl = models.URLField(null=True, blank=True)
    submittedUrl = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    salesperson = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': 'sales'})
    note = models.TextField(blank=True, null=True)
    contact_status = models.CharField(max_length=20, choices=[('Attended', 'Attended'), ('Not Attended', 'Not Attended')], default='Not Attended', null=True, blank=True)
    reached_out_whatsapp = models.BooleanField(default=False, null=True, blank=True)
    reached_out_email = models.BooleanField(default=False, null=True, blank=True)
    survey_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['salesperson']),
            models.Index(fields=['contact_status']),
            models.Index(fields=['survey_date']),
        ]

    def __str__(self):
        return self.fullName or "Unnamed Enquiry"