from rest_framework import serializers
from .models import Step, TestPage

class StepSerializer(serializers.ModelSerializer):
    text = serializers.SerializerMethodField()
    
    class Meta:
        model = Step
        fields = ["id", "text"]

    def get_text(self, obj):
        return {"ru": obj.ru, "en": obj.en, "tj": obj.tj}

    def update(self, instance, validated_data):
        text = self.initial_data.get("text", {})
        instance.ru = text.get("ru", instance.ru)
        instance.en = text.get("en", instance.en)
        instance.tj = text.get("tj", instance.tj)
        instance.save()
        return instance


class TestPageSerializer(serializers.ModelSerializer):
    steps = StepSerializer(many=True)

    class Meta:
        model = TestPage
        fields = "__all__"

    def to_representation(self, instance):
        return instance.to_dict()

    def update(self, instance, validated_data):
        data = self.initial_data

        # навсозии майдонҳо
        for field in [
            "heroTitle",
            "heroSubtitle",
            "heroDescription",
            "howItWorksTitle",
            "levelsTitle",
            "levelsDescription",
        ]:
            vals = data.get(field, {})
            setattr(instance, f"{field}_ru", vals.get("ru", getattr(instance, f"{field}_ru")))
            setattr(instance, f"{field}_en", vals.get("en", getattr(instance, f"{field}_en")))
            setattr(instance, f"{field}_tj", vals.get("tj", getattr(instance, f"{field}_tj")))

        # steps update
        if "steps" in data:
            for s in data["steps"]:
                step = instance.steps.filter(id=s["id"]).first()
                if step:
                    step.ru = s["text"]["ru"]
                    step.en = s["text"]["en"]
                    step.tj = s["text"]["tj"]
                    step.save()

        instance.save()
        return instance
