from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, OTP
from .serializers import UserSerializer, LoginSerializer, ForgotPasswordSerializer, ResetPasswordSerializer, ChangePasswordSerializer, PermissionSerializer
from .utils import generate_otp, generate_password, send_otp_email, send_welcome_email
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(email=serializer.validated_data["email"], password=serializer.validated_data["password"])
        if user:
            refresh = RefreshToken.for_user(user)
            logger.info(f"User {user.email} logged in successfully")
            return Response({
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            })
        logger.error(f"Login failed for email: {serializer.validated_data['email']}")
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                logger.error("No refresh token provided in logout request")
                return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            logger.info(f"User {request.user.email} logged out successfully")
            return Response({"message": "Successfully logged out"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            logger.error(f"Logout failed: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email=email)
            otp = generate_otp()
            OTP.objects.create(email=email, otp=otp)
            send_otp_email(email, otp)
            logger.info(f"OTP sent to {email} for password reset")
            return Response({"message": "OTP sent to email"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            logger.error(f"Forgot password failed: Email {email} not found")
            return Response({"error": "Email not found"}, status=status.HTTP_404_NOT_FOUND)

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]
        password = serializer.validated_data["password"]
        try:
            otp_obj = OTP.objects.filter(email=email, otp=otp).latest("created_at")
            if timezone.now() - otp_obj.created_at > timedelta(minutes=10):
                logger.error(f"Password reset failed for {email}: OTP expired")
                return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            OTP.objects.filter(email=email).delete()
            logger.info(f"Password reset successfully for {email}")
            return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)
        except OTP.DoesNotExist:
            logger.error(f"Password reset failed for {email}: Invalid OTP")
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != "admin" and "profile" not in request.user.permissions:
            logger.error(f"Change password failed for {request.user.email}: Permission denied")
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data["current_password"]):
            logger.error(f"Change password failed for {user.email}: Incorrect current password")
            return Response({"error": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        logger.info(f"Password changed successfully for {user.email}")
        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)

class UserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin":
            logger.error(f"User list access denied for {request.user.email}: Not admin")
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != "admin":
            logger.error(f"User creation denied for {request.user.email}: Not admin")
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        password = generate_password()
        user = User.objects.create(
            email=serializer.validated_data["email"],
            name=serializer.validated_data["name"],
            role="sales",
            permissions=["dashboard", "profile"]
        )
        user.set_password(password)
        user.save()
        send_welcome_email(user.email, user.name, password)
        logger.info(f"User {user.email} created successfully by {request.user.email}")
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, user_id):
        if request.user.role != "admin":
            logger.error(f"User deletion denied for {request.user.email}: Not admin")
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(id=user_id, role="sales")
            user.delete()
            logger.info(f"User {user_id} deleted by {request.user.email}")
            return Response({"message": "User deleted"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            logger.error(f"User deletion failed: User {user_id} not found")
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class PermissionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        if request.user.role != "admin":
            logger.error(f"Permission update denied for {request.user.email}: Not admin")
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        serializer = PermissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(id=user_id)
            validated_permissions = serializer.validated_data["permissions"]
            if user.role == "admin":
                mandatory_permissions = ["dashboard", "profile", "users", "permissions"]
                for perm in mandatory_permissions:
                    if perm not in validated_permissions:
                        validated_permissions.append(perm)
            user.permissions = validated_permissions
            user.save()
            logger.info(f"Permissions updated for user {user_id} by {request.user.email}")
            return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            logger.error(f"Permission update failed: User {user_id} not found")
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)