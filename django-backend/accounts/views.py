from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer
from .models import User
from rest_framework.parsers import MultiPartParser, FormParser

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = serializer.save()
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_admin": user.is_admin,
                "is_learner": user.is_learner
            },
            status=status.HTTP_201_CREATED
        )

class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

class ProfilePictureView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request):
        if 'profile_picture' not in request.FILES:
            return Response(
                {"detail": "No image file provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        user.profile_picture = request.FILES['profile_picture']
        user.save()
        
        return Response(
            {"detail": "Profile picture updated successfully"},
            status=status.HTTP_200_OK
        )

    def delete(self, request):
        user = request.user
        if not user.profile_picture:
            return Response(
                {"detail": "No profile picture to delete"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user.profile_picture.delete()
        user.profile_picture = None
        user.save()
        
        return Response(
            {"detail": "Profile picture deleted successfully"},
            status=status.HTTP_200_OK
        )

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if not refresh_token:
                return Response(
                    {"detail": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify and blacklist the refresh token
            token = RefreshToken(refresh_token)
            
            # Check if token exists in outstanding tokens
            outstanding_token = OutstandingToken.objects.filter(token=str(token)).first()
            if not outstanding_token:
                return Response(
                    {"detail": "Token not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Blacklist both tokens
            token.blacklist()
            
            # Also blacklist the current access token if it exists
            if hasattr(request, 'auth'):
                access_token = str(request.auth)
                outstanding_access_token = OutstandingToken.objects.filter(token=access_token).first()
                if outstanding_access_token:
                    BlacklistedToken.objects.create(token=outstanding_access_token)
            
            return Response(
                {"detail": "Successfully logged out"},
                status=status.HTTP_205_RESET_CONTENT
            )
            
        except TokenError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"detail": "Could not logout. Please try again."},
                status=status.HTTP_400_BAD_REQUEST
            )

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        errors = {}
        
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        new_password2 = request.data.get('new_password_confirmation')

        if not current_password:
            errors['current_password'] = ["This field is required."]
        elif not user.check_password(current_password):
            errors['current_password'] = ["Wrong password."]

        if not new_password:
            errors['new_password'] = ["This field is required."]
        if not new_password2:
            errors['new_password_confirmation'] = ["This field is required."]
        elif new_password != new_password2:
            errors['new_password'] = ["Passwords don't match."]
            errors['new_password_confirmation'] = ["Passwords don't match."]
        elif new_password and len(new_password) < 8:
            errors['new_password'] = ["Password must be at least 8 characters."]
        elif new_password and not any(c.isupper() for c in new_password):
            errors['new_password'] = ["Password must contain at least one uppercase letter."]
        elif new_password and not any(c.islower() for c in new_password):
            errors['new_password'] = ["Password must contain at least one lowercase letter."]
        elif new_password and not any(c.isdigit() for c in new_password):
            errors['new_password'] = ["Password must contain at least one digit."]
        elif new_password and not any(c in '!@#$%^&*()_+' for c in new_password):
            errors['new_password'] = ["Password must contain at least one special character."]

        if errors:
            return Response(
                {"errors": errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response(
            {"detail": "Password updated successfully"},
            status=status.HTTP_200_OK
        )
