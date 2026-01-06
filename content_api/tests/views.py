from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Question, TestResult
from .serializers import TestResultSerializer, QuestionSerializer
from authenticator.models import UserProfile




class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().order_by('id')
    serializer_class = QuestionSerializer

    # filter by level: /questions/?level=A1
    def get_queryset(self):
        level = self.request.query_params.get('level')
        if level:
            return self.queryset.filter(level=level)
        return self.queryset

    # Ready-made actions: /questions/a1/
    @action(detail=False, methods=['get'])
    def a1(self, request):
        return Response(QuestionSerializer(self.queryset.filter(level='A1'), many=True).data)

    @action(detail=False, methods=['get'])
    def a2(self, request):
        return Response(QuestionSerializer(self.queryset.filter(level='A2'), many=True).data)

    @action(detail=False, methods=['get'])
    def b1(self, request):
        return Response(QuestionSerializer(self.queryset.filter(level='B1'), many=True).data)

    @action(detail=False, methods=['get'])
    def b2(self, request):
        return Response(QuestionSerializer(self.queryset.filter(level='B2'), many=True).data)

    @action(detail=False, methods=['get'])
    def c1(self, request):
        return Response(QuestionSerializer(self.queryset.filter(level='C1'), many=True).data)

    @action(detail=False, methods=['get'])
    def c2(self, request):
        return Response(QuestionSerializer(self.queryset.filter(level='C2'), many=True).data)




class TestResultViewSet(viewsets.ModelViewSet):
    queryset = TestResult.objects.all().order_by('-dateCompleted')
    serializer_class = TestResultSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def submit(self, request):
        user = request.user
        profile = UserProfile.objects.get(user=user)

        level = request.data.get("level")
        answers = request.data.get("answers")  # {question_id: index}

        questions = Question.objects.filter(level=level)
        total = questions.count()
        correct = 0

        for q in questions:
            user_answer = answers.get(str(q.id))
            if user_answer == q.correctAnswer:
                correct += 1

        incorrect = total - correct
        score = int(correct / total * 100)

        result = TestResult.objects.create(
            profile=profile,
            level=level,
            totalQuestions=total,
            correctAnswers=correct,
            incorrectAnswers=incorrect,
            score=score,
            answers=answers,   # ✅ Илова шуд
        )

        return Response({
            "message": "Test saved to user profile",
            "result": TestResultSerializer(result).data
        })
