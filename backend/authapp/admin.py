from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django import forms
import json
from .models import CustomUser, Role, PagePermission

class PagePermissionForm(forms.ModelForm):
    permissions = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 5, 'cols': 40}),
        help_text='Enter permissions as a JSON list, e.g., ["dashboard", "profile", "roles", "users", "permissions"]',
        required=False
    )

    class Meta:
        model = PagePermission
        fields = '__all__'

    def clean_permissions(self):
        data = self.cleaned_data['permissions']
        if not data:
            return []
        try:
            permissions = json.loads(data)
            if not isinstance(permissions, list):
                raise forms.ValidationError("Permissions must be a JSON list.")
            return permissions
        except json.JSONDecodeError:
            raise forms.ValidationError("Invalid JSON format for permissions.")

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['email', 'first_name', 'last_name', 'get_roles', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'roles__name']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Roles', {'fields': ('roles',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('OTP', {'fields': ('otp', 'otp_created_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'roles', 'is_active', 'is_staff', 'is_superuser'),
        }),
    )
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['email']
    filter_horizontal = ('roles', 'groups', 'user_permissions')

    def get_roles(self, obj):
        return ", ".join([role.name for role in obj.roles.all()])
    get_roles.short_description = 'Roles'

class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']

class PagePermissionAdmin(admin.ModelAdmin):
    form = PagePermissionForm
    list_display = ['user', 'get_permissions']
    search_fields = ['user__email']
    list_filter = ['user__email']

    def get_permissions(self, obj):
        return ", ".join(obj.permissions) if obj.permissions else "None"
    get_permissions.short_description = 'Permissions'

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Role, RoleAdmin)
admin.site.register(PagePermission, PagePermissionAdmin)