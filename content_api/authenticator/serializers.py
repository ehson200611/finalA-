from datetime import timezone
from rest_framework import serializers
from .models import AdminUser, NotificationAdmin, SMSCode, UserProfile
from tests.models import TestResult
from tests.serializers import TestResultSerializer
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes


from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    phone = serializers.CharField()
    code = serializers.CharField()
    password = serializers.CharField(write_only=True)
    name = serializers.CharField()   # ⬅️ FULLNAME / NAME ИЛОВА ШУД





class LoginSerializer(serializers.Serializer):
    phoneNumber = serializers.CharField()
    password = serializers.CharField(write_only=True)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationAdmin
        fields = "__all__"
        read_only_fields = ["user", "date"]




class UserProfileSerializer(serializers.ModelSerializer):
    # Тестҳои истифодабаранда
    tests = serializers.SerializerMethodField()

    # Барои баргардонидани номи юзер
    user_name = serializers.CharField(source='user.name', read_only=True)

    # role аз property меояд → source лозим нест!
    role = serializers.CharField(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'user',
            'user_name',
            'phone',
            'role',
            'status',
            'is_pdf',
            'pdf_updated_at',
            'tests',
        ]
        read_only_fields = ['id', 'user', 'pdf_updated_at', 'role']

    def get_tests(self, obj):
        tests = obj.get_tests()        # ← TestResult queryset
        return TestResultSerializer(tests, many=True).data



class UserProfilePDFSerializer(serializers.ModelSerializer):
    """Сериализатор только для обновления is_pdf"""
    class Meta:
        model = UserProfile
        fields = ['is_pdf']
    
    def update(self, instance, validated_data):
        from django.utils import timezone
        instance.is_pdf = validated_data.get('is_pdf', instance.is_pdf)
        instance.pdf_updated_at = timezone.now()
        instance.save()
        return instance


class AdminUserListSerializer(serializers.ModelSerializer):
    is_pdf = serializers.BooleanField(source='is_pdf_from_profile')
    
    class Meta:
        model = AdminUser
        fields = ['id', 'name', 'phoneNumber', 'role', 'is_active', 'date_joined', 'is_pdf']
        read_only_fields = ['id', 'date_joined']


class AdminUserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUser
        fields = ['id', 'name', 'phoneNumber', 'role', 'is_active', 'is_staff', 'date_joined','is_pdf']
        read_only_fields = ['id', 'date_joined']


class AdminUserUpdateRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUser
        fields = ['role']

    def validate_role(self, value):
        valid_roles = ['user', 'admin']
        if value not in valid_roles:
            raise serializers.ValidationError(f"Role must be one of {valid_roles}")
        return value


class TestAdminSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source="profile.user.name", read_only=True)
    status = serializers.SerializerMethodField()
    timeSpent = serializers.SerializerMethodField()

    class Meta:
        model = TestResult
        fields = [
            "id",
            "userName",
            "level",
            "dateCompleted",
            "timeSpent",
            "totalQuestions",
            "correctAnswers",
            "incorrectAnswers",
            "score",
            "status",
            "answers",        # ← ← ← ИН ҶО ИЛОВА ШУД
        ]

    @extend_schema_field(OpenApiTypes.STR)
    def get_status(self, obj):
        if obj.correctAnswers is None:
            return "not_started"
        if obj.score < 100 and obj.correctAnswers + obj.incorrectAnswers < obj.totalQuestions:
            return "in_progress"
        return "completed"

    @extend_schema_field(OpenApiTypes.STR)
    def get_timeSpent(self, obj):
        return "N/A"



class AdminRoleSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    passwordConfirm = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = AdminUser
        fields = [
            'id', 'name', 'phoneNumber', 'role', 'is_active',
            'is_staff', 'date_joined', 'password', 'passwordConfirm',
            'is_pdf',     # ← ИН ҶО ИЛОВА ШУД
        ]
        read_only_fields = ['id', 'date_joined']

    def update(self, instance, validated_data):
        # Парол
        password = validated_data.pop('password', None)
        validated_data.pop('passwordConfirm', None)

        # is_pdf пеш аз сохтан
        new_pdf_value = validated_data.get('is_pdf', instance.is_pdf)

        # Навсозии ҳамаи филдҳо
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Парол иваз шавад
        if password:
            instance.set_password(password)

        instance.save()

        # ⬇️  ҲАМИН ҶО — ҲАМЗАМОН USERPROFILE.is_pdf ИВАЗ МЕШАД ⬇️
        try:
            profile = UserProfile.objects.get(user=instance)
            profile.is_pdf = new_pdf_value
            profile.pdf_updated_at = timezone.now()
            profile.save()
        except UserProfile.DoesNotExist:
            pass

        return instance




class ForgotPasswordSerializer(serializers.Serializer):
    phoneNumber = serializers.CharField()



class ResetPasswordSerializer(serializers.Serializer):
    phoneNumber = serializers.CharField()
    password = serializers.CharField()
    passwordConfirm = serializers.CharField()
    code = serializers.CharField()

    def validate(self, data):
        phone = data['phoneNumber']
        code = data['code']

        try:
            sms = SMSCode.objects.filter(phone=phone, purpose='reset_password').latest("created_at")
        except SMSCode.DoesNotExist:
            raise serializers.ValidationError("Code not found for reset password")

        if sms.code != code:
            raise serializers.ValidationError("Wrong code")

        if sms.is_expired():
            raise serializers.ValidationError("Code expired")

        if data['password'] != data['passwordConfirm']:
            raise serializers.ValidationError("Passwords do not match")

        return data



# serializers.py
from rest_framework import serializers

class SendCodeSerializer(serializers.Serializer):
    phoneNumber = serializers.CharField()
    purpose = serializers.ChoiceField(
        choices=[('register', 'Register'), ('reset_password', 'Reset Password'),('notification', "Notofication")],
        default='register',
        required=False
    )

# serializers.py

class AdminUserSetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return data