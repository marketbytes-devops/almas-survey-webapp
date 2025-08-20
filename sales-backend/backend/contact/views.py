import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.db import models
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import requests
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
    """Send email notifications for survey scheduling or cancellation."""
    from_email = settings.DEFAULT_FROM_EMAIL
    service_type_display = SERVICE_TYPE_DISPLAY.get(
        enquiry.serviceType, enquiry.serviceType
    )
    recipients = [enquiry.email] if enquiry.email else []
    if enquiry.salesperson:
        recipients.append(enquiry.salesperson.email)
    if action == "cancel":
        recipients.append(settings.CONTACT_EMAIL)

    try:
        if action == "schedule" or action == "reschedule":
            subject = f'Survey {"Scheduled" if action == "schedule" else "Rescheduled"} for {enquiry.fullName}'
            message = f"""
            Dear {enquiry.fullName},

            Your survey for {service_type_display} has been {action}d.
            Details:
            - Survey Date: {survey_date.strftime('%Y-%m-%d %H:%M')}
            - Service: {service_type_display}
            - Contact: {enquiry.salesperson.first_name if enquiry.salesperson else "N/A"} ({enquiry.salesperson.email if enquiry.salesperson else "N/A"})

            We look forward to assisting you.
            Best regards,
            Almas Movers International
            """
        elif action == "cancel":
            subject = f"Survey Cancelled for {enquiry.fullName}"
            message = f"""
            Dear {enquiry.fullName},

            Your survey for {service_type_display} has been cancelled.
            Reason: {reason}
            Service: {service_type_display}
            Contact: {enquiry.salesperson.first_name if enquiry.salesperson else "N/A"} ({enquiry.salesperson.email if enquiry.salesperson else "N/A"})

            Please contact us for further assistance.
            Best regards,
            Almas Movers International
            """

        email = EmailMultiAlternatives(
            subject=subject,
            body=message,
            from_email=from_email,
            to=recipients,
        )
        html_content = (
            message.replace("\n", "<br>")
            .replace("Dear", "<p>Dear")
            .replace("International", "International</p>")
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        logger.info(f"Survey {action} email sent to {recipients}")
    except Exception as e:
        logger.error(f"Failed to send survey {action} email: {str(e)}", exc_info=True)
        raise

class EnquiryListCreate(generics.ListCreateAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer

    def get_permissions(self):
        """
        Apply IsAdmin permission for GET (listing) requests,
        AllowAny for POST (creation) requests.
        """
        if self.request.method == "GET":
            return [IsAdmin()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        if self.request.user.role == "sales":
            # For sales users, show all enquiries assigned to them
            queryset = queryset.filter(salesperson=self.request.user)
        elif self.request.user.role == "survey-admin":
            # For survey-admin, show unassigned enquiries
            queryset = queryset.filter(salesperson__isnull=True)

        # Apply additional filters based on query params
        if params.get("has_survey") == "true":
            queryset = queryset.filter(survey_date__isnull=False)
        elif params.get("has_survey") == "false":
            queryset = queryset.filter(survey_date__isnull=True)

        # Apply contact_status filter only if provided
        status = params.get("contact_status")
        if status:
            queryset = queryset.filter(contact_status=status)

        start_date = params.get("start_date")
        end_date = params.get("end_date")
        if start_date and end_date:
            try:
                queryset = queryset.filter(
                    created_at__date__range=[start_date, end_date]
                )
            except ValueError as e:
                logger.error(f"Invalid date format for filtering enquiries: {str(e)}")
                return queryset.none()

        search_query = params.get("search")
        if search_query:
            queryset = queryset.filter(
                models.Q(fullName__icontains=search_query)
                | models.Q(email__icontains=search_query)
                | models.Q(phoneNumber__icontains=search_query)
                | models.Q(serviceType__icontains=search_query)
                | models.Q(message__icontains=search_query)
            )

        return queryset.order_by("-created_at")

    def create(self, request, *args, **kwargs):
        recaptcha_token = request.data.get("recaptchaToken")
        if recaptcha_token:
            try:
                recaptcha_response = requests.post(
                    "https://www.google.com/recaptcha/api/siteverify",
                    data={
                        "secret": settings.RECAPTCHA_SECRET_KEY,
                        "response": recaptcha_token,
                    },
                    timeout=10,
                )
                recaptcha_response.raise_for_status()
                recaptcha_data = recaptcha_response.json()

                if (
                    not recaptcha_data.get("success")
                    or recaptcha_data.get("score", 0) < 0.5
                ):
                    logger.warning(f"reCAPTCHA verification failed: {recaptcha_data}")
                    return Response(
                        {
                            "error": "reCAPTCHA verification failed. Please refresh the page."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except requests.RequestException as e:
                logger.error(f"reCAPTCHA verification error: {str(e)}")
                return Response(
                    {"error": "Failed to verify reCAPTCHA. Please refresh the page."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            self.perform_create(serializer)
            enquiry_data = serializer.validated_data
            try:
                if not request.user.is_authenticated or request.user.role != "survey-admin":
                    send_enquiry_emails(enquiry_data)
            except Exception as e:
                logger.error(
                    f"Email sending failed but enquiry saved: {str(e)}", exc_info=True
                )

            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, status=status.HTTP_201_CREATED, headers=headers
            )
        except Exception as e:
            logger.error(f"Failed to process enquiry: {str(e)}", exc_info=True)
            return Response(
                {
                    "error": "An error occurred while processing your enquiry. Please try again later."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class EnquiryRetrieveUpdate(generics.RetrieveUpdateAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == "sales":
            return queryset.filter(salesperson=self.request.user)
        return queryset

class EnquiryDelete(generics.DestroyAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer
    permission_classes = [IsAdmin]

    def perform_destroy(self, instance):
        try:
            logger.info(f"Deleting Enquiry ID: {instance.id}")
            instance.delete()
            logger.info(f"Deleted Enquiry ID: {instance.id}")
        except Exception as e:
            logger.error(f"Failed to delete Enquiry ID: {instance.id}: {str(e)}")
            raise

class EnquiryDeleteAll(generics.GenericAPIView):
    permission_classes = [IsAdmin]

    def delete(self, request, *args, **kwargs):
        try:
            count, _ = Enquiry.objects.all().delete()
            logger.info(f"Deleted all enquiries: {count} records removed")
            return Response(
                {"message": f"Successfully deleted {count} enquiries"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Exception as e:
            logger.error(f"Failed to delete all enquiries: {str(e)}")
            return Response(
                {"error": "Failed to delete enquiries"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class EnquirySchedule(generics.GenericAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer
    permission_classes = [IsAdmin]

    def post(self, request, pk, *args, **kwargs):
        try:
            enquiry = self.get_queryset().get(pk=pk)
            survey_date = request.data.get("survey_date")
            if not survey_date:
                return Response(
                    {"error": "Survey date is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer = self.get_serializer(
                enquiry, data={"survey_date": survey_date}, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            send_survey_email(enquiry, "schedule", survey_date)
            logger.info(
                f"Scheduled survey for Enquiry ID: {enquiry.id} on {survey_date}"
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Enquiry.DoesNotExist:
            logger.error(f"Enquiry ID {pk} not found")
            return Response(
                {"error": "Enquiry not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to schedule survey for Enquiry ID {pk}: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class EnquiryCancelSurvey(generics.GenericAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer
    permission_classes = [IsAdmin]

    def post(self, request, pk, *args, **kwargs):
        try:
            enquiry = self.get_queryset().get(pk=pk)
            reason = request.data.get("reason")
            if not reason:
                return Response(
                    {"error": "Reason for cancellation is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer = self.get_serializer(
                enquiry, data={"survey_date": None}, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            send_survey_email(enquiry, "cancel", reason=reason)
            logger.info(f"Cancelled survey for Enquiry ID: {enquiry.id}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Enquiry.DoesNotExist:
            logger.error(f"Enquiry ID {pk} not found")
            return Response(
                {"error": "Enquiry not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to cancel survey for Enquiry ID {pk}: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)