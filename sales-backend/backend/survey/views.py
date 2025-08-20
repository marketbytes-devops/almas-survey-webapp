from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from authapp.permissions import IsAdmin
from .models import SurveyEnquiry
from authapp.models import CustomUser
from .serializers import SurveyEnquirySerializer, SalespersonSerializer
import logging

logger = logging.getLogger(__name__)

class SurveyEnquiryViewSet(viewsets.ModelViewSet):
    queryset = SurveyEnquiry.objects.all()
    serializer_class = SurveyEnquirySerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'assign']:
            return [IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if user.role == 'sales':
            queryset = queryset.filter(salesperson=user, assigned=True)
        else:
            queryset = queryset.filter(assigned=False)
        return queryset.order_by('-enquiry__created_at')

    def perform_create(self, serializer):
        try:
            serializer.save()
            logger.info(f"Created survey enquiry for {serializer.validated_data.get('customerName', 'Unknown')}")
        except Exception as e:
            logger.error(f"Failed to create survey enquiry: {str(e)}")
            raise

    def perform_update(self, serializer):
        try:
            serializer.save()
            logger.info(f"Updated survey enquiry ID: {serializer.instance.id}")
        except Exception as e:
            logger.error(f"Failed to update survey enquiry ID: {serializer.instance.id}: {str(e)}")
            raise

    def perform_destroy(self, instance):
        try:
            enquiry_id = instance.enquiry.id
            instance.enquiry.delete() 
            instance.delete()  
            logger.info(f"Deleted survey enquiry ID: {instance.id} and enquiry ID: {enquiry_id}")
        except Exception as e:
            logger.error(f"Failed to delete survey enquiry ID: {instance.id}: {str(e)}")
            raise

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def assign(self, request, pk=None):
        try:
            survey_enquiry = self.get_object()
            salesperson_email = request.data.get('salesperson_email')
            note = request.data.get('note')
            if salesperson_email:
                try:
                    salesperson = CustomUser.objects.get(email=salesperson_email, role='sales')
                    survey_enquiry.salesperson = salesperson
                    survey_enquiry.assigned = True
                    survey_enquiry.note = note
                    survey_enquiry.save()
                    logger.info(f"Assigned survey enquiry ID: {pk} to {salesperson_email}")
                except CustomUser.DoesNotExist:
                    return Response(
                        {'error': 'Salesperson with this email does not exist or is not a sales user.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                survey_enquiry.salesperson = None
                survey_enquiry.assigned = False
                survey_enquiry.note = note
                survey_enquiry.save()
                logger.info(f"Unassigned survey enquiry ID: {pk}")
            return Response(SurveyEnquirySerializer(survey_enquiry).data, status=status.HTTP_200_OK)
        except SurveyEnquiry.DoesNotExist:
            logger.error(f"Survey enquiry ID: {pk} not found")
            return Response(
                {'error': 'Survey enquiry not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class SalespersonList(viewsets.ViewSet):
    permission_classes = [IsAdmin]

    def list(self, request):
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