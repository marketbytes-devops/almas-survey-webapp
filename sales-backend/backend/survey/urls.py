from django.urls import path
from .views import SurveyEnquiryListCreate, SurveyEnquiryUpdate, SurveyEnquiryAssign, SurveyEnquiryDelete, SalespersonList

urlpatterns = [
    path('survey-enquiries/', SurveyEnquiryListCreate.as_view(), name='survey-enquiry-list-create'),
    path('survey-enquiries/<int:pk>/', SurveyEnquiryUpdate.as_view(), name='survey-enquiry-update'),
    path('survey-enquiries/<int:pk>/assign/', SurveyEnquiryAssign.as_view(), name='survey-enquiry-assign'),
    path('survey-enquiries/<int:pk>/delete/', SurveyEnquiryDelete.as_view(), name='survey-enquiry-delete'),
    path('salespersons/', SalespersonList.as_view(), name='salesperson-list'),
]