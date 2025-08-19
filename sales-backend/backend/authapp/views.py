from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser, PagePermission
from .serializers import LoginSerializer, ForgotPasswordSerializer, OTPVerificationSerializer, ResetPasswordSerializer, PagePermissionSerializer
import random
import string

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = CustomUser.objects.filter(email=email).first()
            if user and user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'role': user.role,
                    'id': user.id
                }, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = CustomUser.objects.get(email=email)
            otp = user.generate_otp()
            send_mail(
                'Your OTP for Password Reset',
                f'Your OTP is {otp}. It is valid for 10 minutes.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return Response({'message': 'OTP sent to your email'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OTPVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = CustomUser.objects.get(email=email)
            user.otp = None
            user.otp_created_at = None
            user.save()
            return Response({'message': 'OTP verified successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            new_password = serializer.validated_data['new_password']
            user = CustomUser.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        if not name or not email:
            return Response({'error': 'Name and email are required'}, status=status.HTTP_400_BAD_REQUEST)
        if CustomUser.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
        user = CustomUser.objects.create_user(
            email=email,
            password=password,
            first_name=name,
            role='sales'
        )
        
        send_mail(
            'Your Account Credentials',
            f'Your account has been created.\nEmail: {email}\nPassword: {password}\nPlease change your password after logging in.',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        return Response({
            'id': user.id,
            'email': user.email,
            'name': user.first_name,
            'role': user.role
        }, status=status.HTTP_201_CREATED)

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = CustomUser.objects.filter(role='sales')
        data = [{'id': u.id, 'email': u.email, 'name': u.first_name, 'role': u.role} for u in users]
        return Response(data, status=status.HTTP_200_OK)

class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id, role='sales')
            user.delete()
            return Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class PermissionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            permissions = PagePermission.objects.get(user_id=user_id)
            return Response(PagePermissionSerializer(permissions).data, status=status.HTTP_200_OK)
        except PagePermission.DoesNotExist:
            return Response({'permissions': []}, status=status.HTTP_200_OK)

    def post(self, request, user_id):
        try:
            permissions, created = PagePermission.objects.get_or_create(user_id=user_id)
            permissions.permissions = request.data.get('permissions', [])
            permissions.save()
            return Response(PagePermissionSerializer(permissions).data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.data.get('email')
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        if not email or not current_password or not new_password:
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
        user = CustomUser.objects.filter(email=email).first()
        if user and user.check_password(current_password):
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid current password'}, status=status.HTTP_400_BAD_REQUEST)