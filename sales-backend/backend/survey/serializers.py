from rest_framework import serializers
from .models import SurveyEnquiry
from authapp.models import CustomUser
from contact.models import Enquiry

class SalespersonSerializer(serializers.ModelSerializer):
    label = serializers.CharField(source='first_name')
    value = serializers.CharField(source='email')

    class Meta:
        model = CustomUser
        fields = ['value', 'label']

class SurveyEnquirySerializer(serializers.ModelSerializer):
    customerName = serializers.CharField(source='enquiry.fullName')
    phone = serializers.CharField(source='enquiry.phoneNumber')
    email = serializers.CharField(source='enquiry.email')
    service = serializers.CharField(source='enquiry.serviceType')
    message = serializers.CharField(source='enquiry.message')
    date = serializers.DateTimeField(source='enquiry.created_at', read_only=True)
    salesperson_email = serializers.CharField(source='salesperson.email', allow_null=True, required=False)

    class Meta:
        model = SurveyEnquiry
        fields = ['id', 'date', 'customerName', 'phone', 'email', 'service', 'message', 'assigned', 'salesperson_email', 'note']
        read_only_fields = ['id', 'date', 'customerName', 'phone', 'email', 'service', 'message', 'assigned']

    def validate_salesperson_email(self, value):
        if value:
            try:
                salesperson = CustomUser.objects.get(email=value, role='sales')
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError("Salesperson with this email does not exist or is not a sales user.")
            return value
        return None

    def create(self, validated_data):
        enquiry_data = {
            'fullName': validated_data.pop('customerName'),
            'phoneNumber': validated_data.pop('phone'),
            'email': validated_data.pop('email'),
            'serviceType': validated_data.pop('service'),
            'message': validated_data.pop('message'),
            'recaptchaToken': validated_data.pop('recaptchaToken', ''),
            'refererUrl': validated_data.pop('refererUrl', ''),
            'submittedUrl': validated_data.pop('submittedUrl', ''),
        }
        enquiry = Enquiry.objects.create(**enquiry_data)
        survey_enquiry = SurveyEnquiry.objects.create(enquiry=enquiry, **validated_data)
        return survey_enquiry

    def update(self, instance, validated_data):
        enquiry_data = {
            'fullName': validated_data.pop('customerName', instance.enquiry.fullName),
            'phoneNumber': validated_data.pop('phone', instance.enquiry.phoneNumber),
            'email': validated_data.pop('email', instance.enquiry.email),
            'serviceType': validated_data.pop('service', instance.enquiry.serviceType),
            'message': validated_data.pop('message', instance.enquiry.message),
        }
        for key, value in enquiry_data.items():
            setattr(instance.enquiry, key, value)
        instance.enquiry.save()
        return super().update(instance, validated_data)