import random
import string
from django.core.mail import send_mail
from django.conf import settings

def generate_otp():
    return "".join(random.choices(string.digits, k=6))

def generate_password():
    characters = string.ascii_letters + string.digits + string.punctuation
    return "".join(random.choices(characters, k=12))

def send_otp_email(email, otp):
    subject = "Your OTP for Password Reset"
    message = f"Your OTP is: {otp}"
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    )

def send_welcome_email(email, name, password):
    subject = "Welcome to Almas Survey"
    message = f"Hi {name},\n\nYour account has been created.\nEmail: {email}\nPassword: {password}\n\nPlease log in and change your password."
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    )