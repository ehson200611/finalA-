from rest_framework import viewsets, permissions
from rest_framework.parsers import FormParser, MultiPartParser
from drf_yasg.utils import swagger_auto_schema
from .models import Feedback
from .serializers import FeedbackSerializer

class FeedbackViewSet(viewsets.ModelViewSet):
    """
    Feedback CRUD API:
    - create: Add new feedback (form-data)
    - list: List all feedbacks
    - retrieve: Get feedback by ID
    - update/partial_update: Update feedback
    - destroy: Delete feedback
    """
    queryset = Feedback.objects.all().order_by('-created_at')
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.AllowAny]  # Агар мехоҳед list/update/delete танҳо барои админ: IsAdminUser
    parser_classes = [FormParser, MultiPartParser]  # Барои form-data

    @swagger_auto_schema(request_body=FeedbackSerializer)
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
