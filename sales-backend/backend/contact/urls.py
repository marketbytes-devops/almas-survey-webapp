from django.urls import path
from .views import (
    EnquiryListCreate,
    EnquiryDelete,
    EnquiryDeleteAll,
    EnquiryRetrieveUpdate,
    EnquiryAssign,
    EnquirySchedule,
    EnquiryCancelSurvey
)

urlpatterns = [
    path('enquiries/', EnquiryListCreate.as_view(), name='enquiry-list-create'),
    path('enquiries/<int:pk>/', EnquiryRetrieveUpdate.as_view(), name='enquiry-retrieve-update'),
    path('enquiries/<int:pk>/delete/', EnquiryDelete.as_view(), name='enquiry-delete'),
    path('enquiries/delete-all/', EnquiryDeleteAll.as_view(), name='enquiry-delete-all'),
    path('enquiries/<int:pk>/assign/', EnquiryAssign.as_view(), name='enquiry-assign'),
    path('enquiries/<int:pk>/schedule/', EnquirySchedule.as_view(), name='enquiry-schedule'),
    path('enquiries/<int:pk>/cancel-survey/', EnquiryCancelSurvey.as_view(), name='enquiry-cancel-survey'),
]