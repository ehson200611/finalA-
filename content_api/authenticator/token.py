from rest_framework_simplejwt.tokens import RefreshToken


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    # 👇 ИН ҶО МАЪЛУМОТ АЗ USER ИЛОВА МЕКУНЕМ
    refresh["role"] = user.role
    refresh["name"] = user.name
    refresh["phoneNumber"] = user.phoneNumber

    # access token ҳам метони брора
    access = refresh.access_token
    access["role"] = user.role
    access["name"] = user.name
    access["phoneNumber"] = user.phoneNumber

    return {
        "refresh": str(refresh),
        "access": str(access)
    }
