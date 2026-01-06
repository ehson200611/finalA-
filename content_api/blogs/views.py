from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Blog
from .serializers import BlogSerializer

# List/Create
class BlogListCreateView(generics.ListCreateAPIView):
    queryset = Blog.objects.all().order_by('-created_at')
    serializer_class = BlogSerializer
    parser_classes = (MultiPartParser, FormParser)

# Retrieve/Update/Delete
class BlogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    parser_classes = (MultiPartParser, FormParser)  # Барои FormData ва media
