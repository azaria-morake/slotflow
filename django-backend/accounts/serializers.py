from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_admin', 'is_learner', 'profile_picture')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    role = serializers.ChoiceField(
        choices=[('admin', 'Admin'), ('learner', 'Learner')],
        write_only=True,
        required=True
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'role')
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True}
        }

    def validate_email(self, value):
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Enter a valid email address.")
        
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already in use.")
        return value

    def validate(self, attrs):
        errors = {}
        
        if attrs['password'] != attrs['password2']:
            errors['password'] = ["Password fields didn't match."]
            errors['password2'] = ["Password fields didn't match."]
        
        password = attrs['password']
        if len(password) < 8:
            errors['password'] = errors.get('password', []) + ["Password must be at least 8 characters."]
        if not any(c.isupper() for c in password):
            errors['password'] = errors.get('password', []) + ["Password must contain at least one uppercase letter."]
        if not any(c.islower() for c in password):
            errors['password'] = errors.get('password', []) + ["Password must contain at least one lowercase letter."]
        if not any(c.isdigit() for c in password):
            errors['password'] = errors.get('password', []) + ["Password must contain at least one digit."]
        if not any(c in '!@#$%^&*()_+' for c in password):
            errors['password'] = errors.get('password', []) + ["Password must contain at least one special character."]
        
        if errors:
            raise serializers.ValidationError(errors)
            
        return attrs

    def create(self, validated_data):
        role = validated_data.pop('role')
        validated_data.pop('password2')
        
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            is_admin=(role == 'admin'),
            is_learner=(role == 'learner')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_admin'] = user.is_admin
        token['is_learner'] = user.is_learner
        return token

    def validate(self, attrs):
        credentials = {
            'username': '',
            'password': attrs.get("password")
        }
        
        user_obj = User.objects.filter(email=attrs.get("username")).first() or User.objects.filter(username=attrs.get("username")).first()
        
        if not user_obj:
            raise serializers.ValidationError({
                "detail": "No active account found with the given credentials"
            })
            
        credentials['username'] = user_obj.username
        return super().validate(credentials)
