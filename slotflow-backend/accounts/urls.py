from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    UserDetailView,
    CustomTokenObtainPairView,
    LogoutView,
    ChangePasswordView,
    ProfilePictureView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', UserDetailView.as_view(), name='user_detail'),
    path('me/profile-picture/', ProfilePictureView.as_view(), name='profile_picture'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]
