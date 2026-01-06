from django.urls import path
from .views import (
    BookCreateView, BookListView, BookDetailView,
    BookUpdateView, BookDeleteView,
   
)

urlpatterns = [
    # Основные CRUD endpoints
    path('create/', BookCreateView.as_view(), name='book-create'),
    path('list/', BookListView.as_view(), name='book-list'),
    path('detail/<int:pk>/', BookDetailView.as_view(), name='book-detail'),
    path('update/<int:pk>/', BookUpdateView.as_view(), name='book-update'),
    path('delete/<int:pk>/', BookDeleteView.as_view(), name='book-delete'),
    
    # Защищенные PDF endpoints
 
]