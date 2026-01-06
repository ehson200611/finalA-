# bookpage/views.py
from django.http import FileResponse
import os
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Book
from .serializers import BookSerializer


class BookCreateView(generics.CreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [AllowAny]


class BookListView(generics.ListAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [AllowAny]


class BookDetailView(generics.RetrieveAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [AllowAny]


class BookUpdateView(generics.UpdateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [AllowAny]


class BookDeleteView(generics.DestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [AllowAny]


class ReadBookPDFView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
            
            if not book.pdf or not os.path.exists(book.pdf.path):
                return Response(
                    {"error": "PDF file not found"},
                    status=404
                )
            
            pdf_file = open(book.pdf.path, 'rb')
            
            response = FileResponse(
                pdf_file,
                content_type='application/pdf'
            )
            response['Content-Disposition'] = f'inline; filename="{book.title}.pdf"'
            
            return response
            
        except Book.DoesNotExist:
            return Response(
                {"error": "Book not found"},
                status=404
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=500
            )