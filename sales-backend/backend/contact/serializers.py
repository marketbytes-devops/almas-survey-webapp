from rest_framework import serializers
from .models import Enquiry
from authapp.models import CustomUser
import logging

logger = logging.getLogger(__name__)

class EnquirySerializer(serializers.ModelSerializer):
    """
    Serializer for the Enquiry model.
    Validates and serializes enquiry form data.
    """
    salesperson_email = serializers.CharField(source='salesperson.email', required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Enquiry
        fields = [
            'id', 'fullName', 'phoneNumber', 'email', 'serviceType', 'message',
            'recaptchaToken', 'refererUrl', 'submittedUrl', 'created_at',
            'salesperson_email', 'note', 'contact_status', 'reached_out_whatsapp',
            'reached_out_email', 'survey_date'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_serviceType(self, value):
        """
        Validate that serviceType is one of the allowed values.
        """
        if value:
            allowed_services = ['localMove', 'internationalMove', 'carExport', 'storageServices', 'logistics']
            if value not in allowed_services:
                raise serializers.ValidationError("Invalid service type.")
        return value

    def validate_email(self, value):
        """
        Ensure email is in a valid format if provided.
        """
        if value and ('@' not in value or '.' not in value):
            raise serializers.ValidationError("Invalid email format.")
        return value

    def validate_salesperson_email(self, value):
        """
        Validate salesperson email if provided.
        """
        if value:
            try:
                salesperson = CustomUser.objects.get(email=value, role='sales')
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError("Salesperson with this email does not exist or is not a sales user.")
        return value

    def validate(self, data):
        """
        Ensure at least one field (fullName, phoneNumber, email, serviceType, message) is provided.
        """
        fields = ['fullName', 'phoneNumber', 'email', 'serviceType', 'message']
        if not any(data.get(field) for field in fields):
            raise serializers.ValidationError("At least one of fullName, phoneNumber, email, serviceType, or message must be provided.")
        logger.debug(f"Validated data: {data}")
        return data

    def create(self, validated_data):
        """
        Create an Enquiry instance with salesperson handling.
        """
        logger.debug(f"Creating enquiry with validated data: {validated_data}")
        salesperson_email = validated_data.pop('salesperson_email', None)
        salesperson = None
        if salesperson_email:
            salesperson = CustomUser.objects.get(email=salesperson_email, role='sales')
        enquiry = Enquiry.objects.create(salesperson=salesperson, **validated_data)
        logger.debug(f"Created Enquiry ID: {enquiry.id}")
        return enquiry

    def update(self, instance, validated_data):
        """
        Update an Enquiry instance with salesperson handling.
        """
        logger.debug(f"Updating Enquiry ID: {instance.id} with data: {validated_data}")
        salesperson_email = validated_data.pop('salesperson_email', None)
        if salesperson_email:
            instance.salesperson = CustomUser.objects.get(email=salesperson_email, role='sales')
        elif salesperson_email == '':
            instance.salesperson = None
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        logger.debug(f"Updated Enquiry ID: {instance.id}")
        return instance