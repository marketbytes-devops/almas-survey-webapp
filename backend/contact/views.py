import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from authapp.models import CustomUser
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Enquiry
from .serializers import EnquirySerializer
from authapp.permissions import IsAdmin

logger = logging.getLogger(__name__)

SERVICE_TYPE_DISPLAY = {
    "localMove": "Local Move",
    "internationalMove": "International Move",
    "carExport": "Car Import and Export",
    "storageServices": "Storage Services",
    "logistics": "Logistics",
}

def send_enquiry_emails(enquiry_data):
    service_type_display = SERVICE_TYPE_DISPLAY.get(
        enquiry_data["serviceType"], enquiry_data["serviceType"]
    )
    from_email = settings.DEFAULT_FROM_EMAIL

    try:
        if enquiry_data["email"]:
            user_subject = "Thank You for Your Enquiry"
            user_message = f"""
            Hi {enquiry_data['fullName']},
            Thank you for your enquiry regarding our {service_type_display} services.
            We have received your message and will get back to you soon.
            Here's a summary of your enquiry:
            - Service: {service_type_display}
            - Message: {enquiry_data.get('message', 'N/A')}
            Best regards,
            Almas Movers International
            Website: www.almasintl.com
            """
            try:
                send_mail(
                    subject=user_subject,
                    message=user_message,
                    from_email=from_email,
                    recipient_list=[enquiry_data["email"]],
                    fail_silently=False,
                )
                logger.info(f"User enquiry email sent to {enquiry_data['email']}")
            except Exception as e:
                logger.error(
                    f"Failed to send user email to {enquiry_data['email']}: {str(e)}",
                    exc_info=True,
                )

        bcc_recipients = []
        if hasattr(settings, "BCC_CONTACT_EMAILS"):
            if isinstance(settings.BCC_CONTACT_EMAILS, str):
                bcc_recipients = [
                    email.strip()
                    for email in settings.BCC_CONTACT_EMAILS.split(",")
                    if email.strip()
                ]
            elif isinstance(settings.BCC_CONTACT_EMAILS, (list, tuple)):
                bcc_recipients = list(settings.BCC_CONTACT_EMAILS)

        admin_subject = (
            f'New Enquiry: {service_type_display} from {enquiry_data["fullName"]}'
        )
        admin_message = f"""
        New enquiry received:
        Name: {enquiry_data["fullName"]}
        Phone: {enquiry_data["phoneNumber"]}
        Email: {enquiry_data["email"]}
        Service Type: {service_type_display}
        Message: {enquiry_data.get("message", "N/A")}
        Referer URL: {enquiry_data.get("refererUrl", "N/A")}
        Submitted URL: {enquiry_data.get("submittedUrl", "N/A")}
        Salesperson: {enquiry_data.get("salesperson_email", "N/A")}
        Note: {enquiry_data.get("note", "N/A")}
        """
        html_content = f"""
        <html>
            <body>
                <h2>New enquiry received:</h2>
                <p><strong>Name:</strong> {enquiry_data["fullName"]}</p>
                <p><strong>Phone:</strong> {enquiry_data["phoneNumber"]}</p>
                <p><strong>Email:</strong> {enquiry_data["email"]}</p>
                <p><strong>Service Type:</strong> {service_type_display}</p>
                <p><strong>Message:</strong> {enquiry_data.get("message", "N/A")}</p>
                <p><strong>Referer URL:</strong> {enquiry_data.get("refererUrl", "N/A")}</p>
                <p><strong>Submitted URL:</strong> {enquiry_data.get("submittedUrl", "N/A")}</p>
                <p><strong>Salesperson:</strong> {enquiry_data.get("salesperson_email", "N/A")}</p>
                <p><strong>Note:</strong> {enquiry_data.get("note", "N/A")}</p>
            </body>
        </html>
        """
        try:
            email = EmailMultiAlternatives(
                subject=admin_subject,
                body=admin_message,
                from_email=from_email,
                to=[settings.CONTACT_EMAIL],
                bcc=bcc_recipients,
                reply_to=[enquiry_data["email"]] if enquiry_data["email"] else [],
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
            logger.info(
                f"Admin email sent to {settings.CONTACT_EMAIL} with BCC to {bcc_recipients}"
            )
        except Exception as e:
            logger.error(
                f"Failed to send admin email to {settings.CONTACT_EMAIL}: {str(e)}",
                exc_info=True,
            )

    except Exception as e:
        logger.error(f"Failed to send enquiry emails: {str(e)}", exc_info=True)
        raise

def send_survey_email(enquiry, action, survey_date=None, reason=None):
    from_email = settings.DEFAULT_FROM_EMAIL
    service_type_display = enquiry.serviceType
    recipients = [enquiry.email] if enquiry.email else []

    email_receivers = CustomUser.objects.filter(enable_email_receiver=True)
    recipients.extend([user.email for user in email_receivers])

    try:
        if action in ("schedule", "reschedule"):
            subject = f'Survey {action.capitalize()} for {enquiry.fullName}'
            message = f"""
            Dear {enquiry.fullName},

            Your survey for {service_type_display} has been {action}d.
            Survey Date: {survey_date.strftime('%Y-%m-%d %H:%M') if survey_date else 'N/A'}
            Contact: {settings.CONTACT_EMAIL}
            """
        elif action == "cancel":
            subject = f"Survey Cancelled for {enquiry.fullName}"
            message = f"""
            Dear {enquiry.fullName},

            Your survey for {service_type_display} has been cancelled.
            Reason: {reason}
            Contact: {settings.CONTACT_EMAIL}
            """
        else:
            subject = "Survey Notification"
            message = "Survey status changed."

        email = EmailMultiAlternatives(
            subject=subject,
            body=message,
            from_email=from_email,
            to=recipients
        )
        email.send(fail_silently=False)
    except Exception as e:
        pass


class EnquiryListCreate(generics.ListCreateAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer

def get_permissions(self):
    if self.request.method == "GET":
        return [IsAuthenticated()]
    return [AllowAny()]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        has_survey = self.request.query_params.get("has_survey")
        contact_status = self.request.query_params.get("contact_status")
        unassigned = self.request.query_params.get("unassigned")
        assigned_user_email = self.request.query_params.get("assigned_user_email")

        if not user.is_authenticated:
            return queryset.none()

        if assigned_user_email:
            queryset = queryset.filter(assigned_user__email__iexact=assigned_user_email)
        if contact_status:
            queryset = queryset.filter(contact_status=contact_status)
        if unassigned == "true":
            queryset = queryset.filter(assigned_user__isnull=True)
        if has_survey == "true":
            queryset = queryset.filter(survey_date__isnull=False)
        elif has_survey == "false":
            queryset = queryset.filter(survey_date__isnull=True)

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        enquiry = serializer.save()
        return Response(self.serializer_class(enquiry).data, status=status.HTTP_201_CREATED)


class EnquiryRetrieveUpdate(generics.RetrieveUpdateAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()
        return queryset

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class EnquiryDelete(generics.DestroyAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer
    permission_classes = [IsAdmin]

    def perform_destroy(self, instance):
        instance.delete()

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": "Enquiry deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


class EnquiryDeleteAll(generics.GenericAPIView):
    permission_classes = [IsAdmin]

    def delete(self, request, *args, **kwargs):
        count, _ = Enquiry.objects.all().delete()
        return Response({"message": f"Successfully deleted {count} enquiries"}, status=status.HTTP_204_NO_CONTENT)


class EnquirySchedule(generics.GenericAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        enquiry = self.get_queryset().get(pk=pk)
        survey_date = request.data.get("survey_date")
        if not survey_date:
            return Response({"error": "Survey date is required"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(enquiry, data={"survey_date": survey_date}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        send_survey_email(enquiry, "schedule", survey_date)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EnquiryCancelSurvey(generics.GenericAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        enquiry = self.get_queryset().get(pk=pk)
        reason = request.data.get("reason")
        if not reason:
            return Response({"error": "Reason for cancellation is required"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(enquiry, data={"survey_date": None}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        send_survey_email(enquiry, "cancel", reason=reason)
        return Response(serializer.data, status=status.HTTP_200_OK)