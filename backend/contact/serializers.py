from rest_framework import serializers
from .models import Enquiry
from authapp.models import CustomUser
from django.db import transaction

class EnquirySerializer(serializers.ModelSerializer):
    assigned_user_email = serializers.CharField(source='assigned_user.email', required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Enquiry
        fields = [
            'id', 'fullName', 'phoneNumber', 'email', 'serviceType', 'message',
            'recaptchaToken', 'refererUrl', 'submittedUrl', 'created_at',
            'assigned_user_email', 'note', 'contact_status', 'reached_out_whatsapp',
            'reached_out_email', 'survey_date'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_assigned_user_email(self, value):
        if value:
            try:
                user = CustomUser.objects.get(email__iexact=value)
                return user.email
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError(f"User with email {value} does not exist.")
        return value

    def create(self, validated_data):
        assigned_user_email = validated_data.pop('assigned_user_email', None)
        assigned_user = None
        if assigned_user_email:
            try:
                assigned_user = CustomUser.objects.get(email__iexact=assigned_user_email)
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError(f"User with email {assigned_user_email} does not exist.")
        with transaction.atomic():
            enquiry = Enquiry.objects.create(assigned_user=assigned_user, **validated_data)
        return enquiry

    def update(self, instance, validated_data):
        assigned_user_data = validated_data.pop('assigned_user', None)
        assigned_user_email = None
        if assigned_user_data and 'email' in assigned_user_data:
            assigned_user_email = assigned_user_data['email']
        elif 'assigned_user_email' in validated_data:
            assigned_user_email = validated_data.pop('assigned_user_email', None)
        if assigned_user_email is not None:
            if assigned_user_email:
                try:
                    assigned_user = CustomUser.objects.get(email__iexact=assigned_user_email)
                    instance.assigned_user = assigned_user
                except CustomUser.DoesNotExist:
                    raise serializers.ValidationError(f"User with email {assigned_user_email} does not exist.")
            else:
                instance.assigned_user = None
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance