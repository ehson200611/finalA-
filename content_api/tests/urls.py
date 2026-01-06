from rest_framework.routers import DefaultRouter
from .views import QuestionViewSet,TestResultViewSet

router = DefaultRouter()
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r"testresults", TestResultViewSet, basename='testresult')
urlpatterns = router.urls
