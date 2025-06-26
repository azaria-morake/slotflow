from django.urls import path
from .views import BookingListView, CancelBookingView

urlpatterns = [
    path('', BookingListView.as_view(), name='booking-list'),
    path('<int:pk>/cancel/', CancelBookingView.as_view(), name='cancel-booking'),
]
