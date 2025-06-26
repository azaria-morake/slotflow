from django.urls import path
from .views import CourseListView, CourseDetailView, CoursePictureView, ActiveCourseListView, InactiveCourseListView

urlpatterns = [
    path('', CourseListView.as_view(), name='course-list'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('<int:pk>/course-picture/', CoursePictureView.as_view(), name='course-picture'),
    path('active/', ActiveCourseListView.as_view(), name='active-courses'),
    path('inactive/', InactiveCourseListView.as_view(), name='inactive-courses'),

]
