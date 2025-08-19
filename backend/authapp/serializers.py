from rest_framework import serializers
from .models import User, OTP

VALID_PERMISSIONS = [
    "dashboard",
    "enquiries",
    "processing-enquiries",
    "follow-ups",
    "scheduled-surveys",
    "new-enquiries",
    "profile",
    "users",
    "permissions"
]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "role", "permissions"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if isinstance(data["permissions"], dict) and "permissions" in data["permissions"]:
            data["permissions"] = data["permissions"]["permissions"]
        return data

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    password = serializers.CharField(min_length=6)

class ChangePasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    current_password = serializers.CharField()
    new_password = serializers.CharField(min_length=6)

class PermissionSerializer(serializers.Serializer):
    permissions = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=True
    )

    def validate_permissions(self, value):
        invalid_permissions = [perm for perm in value if perm not in VALID_PERMISSIONS]
        if invalid_permissions:
            raise serializers.ValidationError(f"Invalid permissions: {invalid_permissions}")
        return value