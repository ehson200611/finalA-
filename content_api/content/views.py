from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import TestPage
from .serializers import TestPageSerializer

class TestPageView(APIView):
    def get(self, request):
        page = TestPage.objects.first()
        if not page:
            return Response({"error": "not found"}, status=404)
        return Response(page.to_dict())

    def put(self, request):
        page = TestPage.objects.first()
        if not page:
            return Response({"error": "not found"}, status=404)

        serializer = TestPageSerializer(page, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        # 🔽 Ин хатҳоро илова кун
        print("❌ Serializer errors:", serializer.errors)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

