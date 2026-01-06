from django.urls import path
from .views import BlogListCreateView, BlogDetailView

urlpatterns = [
    path('blogs/', BlogListCreateView.as_view(), name='blogs_list_create'),
    path('blogs/<int:pk>/', BlogDetailView.as_view(), name='blog_detail'),  # 👈 Update/Delete
]
