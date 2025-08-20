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
    customerName = serializers.CharField(source='enquiry.fullName', required=False)
    phone = serializers.CharField(source='enquiry.phoneNumber', required=False)
    email = serializers.CharField(source='enquiry.email', required=False)
    service = serializers.CharField(source='enquiry.serviceType', required=False)
    message = serializers.CharField(source='enquiry.message', required=False)
    date = serializers.DateTimeField(source='enquiry.created_at', read_only=True)
    salesperson_email = serializers.CharField(source='salesperson.email', allow_null=True, required=False)
    assigned = serializers.BooleanField(required=False, allow_null=True)

    class Meta:
        model = SurveyEnquiry
        fields = ['id', 'date', 'customerName', 'phone', 'email', 'service', 'message', 'assigned', 'salesperson_email', 'note']
        read_only_fields = ['id', 'date']

    def validate_salesperson_email(self, value):
        if value:
            try:
                salesperson = CustomUser.objects.get(email=value, role='sales')
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError("Salesperson with this email does not exist or is not a sales user.")
            return value
        return None

    def validate(self, data):
        if self.context['request'].method == 'POST':
            required_fields = ['customerName', 'phone', 'email', 'service', 'message']
            for field in required_fields:
                if field not in data or not data[field]:
                    raise serializers.ValidationError({field: "This field is required for creating an enquiry."})
        return data

    def create(self, validated_data):
        enquiry_data = {
            'fullName': validated_data.pop('customerName', ''),
            'phoneNumber': validated_data.pop('phone', ''),
            'email': validated_data.pop('email', ''),
            'serviceType': validated_data.pop('service', ''),
            'message': validated_data.pop('message', ''),
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

        if 'salesperson_email' in validated_data:
            instance.salesperson = CustomUser.objects.get(email=validated_data.pop('salesperson_email')) if validated_data['salesperson_email'] else None
        if 'note' in validated_data:
            instance.note = validated_data.pop('note')
        if 'assigned' in validated_data:
            instance.assigned = validated_data.pop('assigned')
        instance.save()
        return instance