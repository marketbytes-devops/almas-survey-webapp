from rest_framework import serializers
from .models import Enquiry
from authapp.models import CustomUser
import logging
from django.db import transaction
from django.db.models import Q

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
                # Case-insensitive email lookup
                salesperson = CustomUser.objects.get(Q(email__iexact=value) & Q(role='sales'))
                logger.debug(f"Found salesperson: {value} (resolved to {salesperson.email}) with role 'sales'")
                return salesperson.email  # Return the actual email from the database
            except CustomUser.DoesNotExist:
                logger.error(f"Salesperson with email {value} not found or not a sales user")
                raise serializers.ValidationError(f"Salesperson with email {value} does not exist or is not a sales user.")
        return value

    def validate(self, data):
        """
        Ensure at least one field (fullName, phoneNumber, email, serviceType, message) is provided for creation.
        Skip this validation for partial updates (e.g., assign endpoint).
        """
        if not self.partial:
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
            try:
                salesperson = CustomUser.objects.get(Q(email__iexact=salesperson_email) & Q(role='sales'))
                logger.debug(f"Assigned salesperson: {salesperson.email}")
            except CustomUser.DoesNotExist:
                logger.error(f"Salesperson with email {salesperson_email} not found")
                raise serializers.ValidationError(f"Salesperson with email {salesperson_email} does not exist or is not a sales user.")
        try:
            with transaction.atomic():
                enquiry = Enquiry.objects.create(salesperson=salesperson, **validated_data)
                logger.info(f"Created Enquiry ID: {enquiry.id} with salesperson: {salesperson.email if salesperson else None}")
                return enquiry
        except Exception as e:
            logger.error(f"Failed to create enquiry: {str(e)}", exc_info=True)
            raise

    def update(self, instance, validated_data):
        """
        Update an Enquiry instance with salesperson handling.
        """
        logger.debug(f"Updating Enquiry ID: {instance.id} with data: {validated_data}")
        # Handle nested salesperson dictionary due to source='salesperson.email'
        salesperson_data = validated_data.pop('salesperson', None)
        salesperson_email = None
        if salesperson_data and 'email' in salesperson_data:
            salesperson_email = salesperson_data['email']
        elif 'salesperson_email' in validated_data:
            salesperson_email = validated_data.pop('salesperson_email', None)

        with transaction.atomic():
            if salesperson_email is not None:
                logger.debug(f"Processing salesperson_email: {salesperson_email}")
                if salesperson_email:
                    try:
                        salesperson = CustomUser.objects.get(Q(email__iexact=salesperson_email) & Q(role='sales'))
                        instance.salesperson = salesperson
                        logger.info(f"Set salesperson to {salesperson.email} for Enquiry ID: {instance.id}")
                    except CustomUser.DoesNotExist:
                        logger.error(f"Salesperson with email {salesperson_email} not found")
                        raise serializers.ValidationError(f"Salesperson with email {salesperson_email} does not exist or is not a sales user.")
                else:
                    instance.salesperson = None
                    logger.info(f"Cleared salesperson for Enquiry ID: {instance.id}")

            for attr, value in validated_data.items():
                logger.debug(f"Updating field {attr} to {value}")
                setattr(instance, attr, value)
            try:
                instance.save()
                logger.info(f"Saved Enquiry ID: {instance.id} with salesperson: {instance.salesperson.email if instance.salesperson else None}")
                return instance
            except Exception as e:
                logger.error(f"Failed to save Enquiry ID: {instance.id}: {str(e)}", exc_info=True)
                raise serializers.ValidationError(f"Failed to save enquiry: {str(e)}")