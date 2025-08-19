from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("sales", "Salesperson"),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="sales")
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    permissions = models.JSONField(default=list)
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        if isinstance(self.permissions, dict) and "permissions" in self.permissions:
            self.permissions = self.permissions["permissions"]
        if self.role == "admin":
            default_permissions = ["dashboard", "profile", "users", "permissions"]
            if not self.permissions:
                self.permissions = default_permissions
            else:
                for perm in default_permissions:
                    if perm not in self.permissions:
                        self.permissions.append(perm)
        super().save(*args, **kwargs)

class OTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)