# sms_service.py
import hashlib
import time
import requests
from typing import Dict, Any

SMS_LOGIN = "maximus144196"
SMS_HASH = "d92d6db94d88a980e9f12dc72445093b"
SMS_SENDER = "A-Plus LC"
SMS_SERVER = "https://api.osonsms.com/sendsms_v1.php"

def format_sms_code(phone: str, code: str, purpose: str) -> str:
    """Фарқ кардани матни SMS вобаста ба мақсад"""
    if purpose == 'register':
        msg = (
            f"A-Plus LC: Ваш код подтверждения для регистрации — {code}. "
            "Не сообщайте его никому."
        )
    elif purpose == 'reset_password':
        msg = (
            f"A-Plus LC: Ваш код для сброса пароля — {code}. "
            "Если вы не запрашивали сброс, проигнорируйте это сообщение."
        )
    elif purpose == 'notification' :
        msg = (
            f"A-Plus LC: Уведомление — ваш код подтверждения: {code}. "
            "Если вы не запрашивали это действие, просто игнорируйте сообщение."
        )

    else:
        msg = f"A-Plus LC: Ваш код — {code}."
    return msg

def send_sms_code(phone: str, msg: str) -> Dict[str, Any]:
    txn_id = str(int(time.time()))
    str_to_hash = f"{txn_id};{SMS_LOGIN};{SMS_SENDER};{phone};{SMS_HASH}"
    str_hash = hashlib.sha256(str_to_hash.encode()).hexdigest()

    url = (
        f"{SMS_SERVER}"
        f"?login={SMS_LOGIN}"
        f"&str_hash={str_hash}"
        f"&from={SMS_SENDER}"
        f"&phone_number={phone}"
        f"&msg={requests.utils.quote(msg)}"
        f"&txn_id={txn_id}"
    )

    try:
        response = requests.get(url, timeout=1)
        response.raise_for_status()
        data = response.json()
        print("OSON request:", url)
        print("OSON response:", data)
        return data
    except requests.RequestException as e:
        print("Ошибка при отправке SMS:", e)
        return {"error": str(e)}
