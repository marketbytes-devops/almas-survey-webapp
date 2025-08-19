from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from authapp.permissions import IsAdmin
from .models import SurveyEnquiry
from authapp.models import CustomUser
from contact.models import Enquiry
from .serializers import SurveyEnquirySerializer, SalespersonSerializer
import logging

logger = logging.getLogger(__name__)

class SurveyEnquiryListCreate(generics.ListCreateAPIView):
    queryset = SurveyEnquiry.objects.all()
    serializer_class = SurveyEnquirySerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset().filter(assigned=False)
        if user.role == 'sales':
            queryset = queryset.filter(salesperson=user)
        return queryset.order_by('-enquiry__created_at')

    def perform_create(self, serializer):
        try:
            enquiry_data = {
                'fullName': serializer.validated_data['customerName'],
                'phoneNumber': serializer.validated_data['phone'],
                'email': serializer.validated_data['email'],
                'serviceType': serializer.validated_data['service'],
                'message': serializer.validated_data['message'],
                'recaptchaToken': self.request.data.get('recaptchaToken', ''),
                'refererUrl': self.request.data.get('refererUrl', ''),
                'submittedUrl': self.request.data.get('submittedUrl', ''),
            }
            enquiry = Enquiry.objects.create(**enquiry_data)
            serializer.save(enquiry=enquiry)
            logger.info(f"Created survey enquiry for {enquiry_data['fullName']}")
        except Exception as e:
            logger.error(f"Failed to create survey enquiry: {str(e)}")
            raise

class SurveyEnquiryUpdate(generics.UpdateAPIView):
    queryset = SurveyEnquiry.objects.all()
    serializer_class = SurveyEnquirySerializer
    permission_classes = [IsAdmin]

    def perform_update(self, serializer):
        try:
            enquiry = serializer.instance.enquiry
            enquiry_data = {
                'fullName': serializer.validated_data['customerName'],
                'phoneNumber': serializer.validated_data['phone'],
                'email': serializer.validated_data['email'],
                'serviceType': serializer.validated_data['service'],
                'message': serializer.validated_data['message'],
            }
            for key, value in enquiry_data.items():
                setattr(enquiry, key, value)
            enquiry.save()
            serializer.save()
            logger.info(f"Updated survey enquiry ID: {serializer.instance.id}")
        except Exception as e:
            logger.error(f"Failed to update survey enquiry ID: {serializer.instance.id}: {str(e)}")
            raise

class SurveyEnquiryAssign(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            survey_enquiry = SurveyEnquiry.objects.get(pk=pk)
            salesperson_email = request.data.get('salesperson_email')
            note = request.data.get('note')
            if salesperson_email:
                try:
                    salesperson = CustomUser.objects.get(email=salesperson_email, role='sales')
                except CustomUser.DoesNotExist:
                    return Response(
                        {'error': 'Salesperson with this email does not exist or is not a sales user.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                survey_enquiry.salesperson = salesperson
                survey_enquiry.assigned = True
                survey_enquiry.note = note
                survey_enquiry.save()
                logger.info(f"Assigned survey enquiry ID: {pk} to {salesperson_email}")
                return Response(SurveyEnquirySerializer(survey_enquiry).data, status=status.HTTP_200_OK)
            return Response(
                {'error': 'Salesperson email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except SurveyEnquiry.DoesNotExist:
            logger.error(f"Survey enquiry ID: {pk} not found")
            return Response(
                {'error': 'Survey enquiry not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class SurveyEnquiryDelete(generics.DestroyAPIView):
    queryset = SurveyEnquiry.objects.all()
    serializer_class = SurveyEnquirySerializer
    permission_classes = [IsAdmin]

    def perform_destroy(self, instance):
        try:
            instance.enquiry.delete() 
            logger.info(f"Deleted survey enquiry ID: {instance.id}")
        except Exception as e:
            logger.error(f"Failed to delete survey enquiry ID: {instance.id}: {str(e)}")
            raise

class SalespersonList(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            salespersons = CustomUser.objects.filter(role='sales')
            serializer = SalespersonSerializer(salespersons, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to fetch salespersons: {str(e)}")
            return Response(
                {'error': 'Failed to fetch salespersons'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )