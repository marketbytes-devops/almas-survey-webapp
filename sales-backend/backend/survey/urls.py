from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SurveyEnquiryViewSet, SalespersonList

router = DefaultRouter()
router.register(r'survey-enquiries', SurveyEnquiryViewSet, basename='survey-enquiry')
router.register(r'salespersons', SalespersonList, basename='salesperson')

urlpatterns = [
    path('', include(router.urls)),
]