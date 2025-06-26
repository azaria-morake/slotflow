from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Course
from .serializers import CourseSerializer
from accounts.models import User
from django.utils import timezone

class CourseListView(generics.ListCreateAPIView):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        # Ensure new courses are always active by default
        serializer.save(instructor=self.request.user, is_active=True)

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def perform_update(self, serializer):
        instance = self.get_object()
        
        # Prevent updating is_active directly
        if 'is_active' in self.request.data:
            del self.request.data['is_active']
            
        serializer.save(instructor=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(
            {"detail": "Course deactivated successfully"},
            status=status.HTTP_200_OK
        )


class CoursePictureView(generics.GenericAPIView):
    queryset = Course.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request, pk):
        course = self.get_object()
        if 'course_picture' not in request.FILES:
            return Response(
                {"detail": "No image file provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if course.course_picture:
            course.course_picture.delete()
        
        course.course_picture = request.FILES['course_picture']
        course.save()
        
        return Response(
            {"detail": "Course picture updated successfully"},
            status=status.HTTP_200_OK
        )

    def delete(self, request, pk):
        course = self.get_object()
        if not course.course_picture:
            return Response(
                {"detail": "No course picture to delete"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        course.course_picture.delete()
        course.course_picture = None
        course.save()
        
        return Response(
            {"detail": "Course picture deleted successfully"},
            status=status.HTTP_200_OK
        )

class ActiveCourseListView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Course.objects.filter(is_active=True)


class InactiveCourseListView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Course.objects.filter(is_active=False)

