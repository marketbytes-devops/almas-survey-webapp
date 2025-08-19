from django.urls import path
from .views import LoginView, ForgotPasswordView, ResetPasswordView, ChangePasswordView, UserView, UserDetailView, PermissionView, LogoutView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("users/", UserView.as_view(), name="users"),
    path("users/<int:user_id>/", UserDetailView.as_view(), name="user-detail"),
    path("permissions/<int:user_id>/", PermissionView.as_view(), name="permissions"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]