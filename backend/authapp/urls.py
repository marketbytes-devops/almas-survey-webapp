from django.urls import path
from .views import LoginView, LogoutView, ForgotPasswordView, OTPVerificationView, ResetPasswordView, CreateUserView, UserListView, UserDeleteView, PermissionView, ChangePasswordView, RoleView, RoleNameEmailView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('otp-verification/', OTPVerificationView.as_view(), name='otp-verification'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('users/', CreateUserView.as_view(), name='create-user'),
    path('users/list/', UserListView.as_view(), name='user-list'),
    path('users/<int:user_id>/delete/', UserDeleteView.as_view(), name='user-delete'),
    path('permissions/<int:user_id>/', PermissionView.as_view(), name='permissions'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('roles/', RoleView.as_view(), name='roles'),
    path('roles/<int:pk>/', RoleView.as_view(), name='role-detail'),
    path('roles/<str:name>/<str:email>/', RoleNameEmailView.as_view(), name='role-name-email'),
]
