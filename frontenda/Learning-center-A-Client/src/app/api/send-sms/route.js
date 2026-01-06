import crypto from "crypto";

export async function POST(req) {
  try {
    const { phone, code } = await req.json();

    // Данные из .env.local
    const login = process.env.SMS_LOGIN;
    const pass_salt_hash = process.env.SMS_HASH;
    const from = process.env.SMS_SENDER;
    const msg = `Код подверждения: ${code}`;
    const txn_id = Date.now().toString();

    // Генерация str_hash по формуле OSON
    const str = `${txn_id};${login};${from};${phone};${pass_salt_hash}`;
    const str_hash = crypto.createHash("sha256").update(str).digest("hex");

    const url = `${
      process.env.SMS_SERVER
    }?login=${login}&str_hash=${str_hash}&from=${from}&phone_number=${phone}&msg=${encodeURIComponent(
      msg
    )}&txn_id=${txn_id}`;

    const response = await fetch(url);
    const data = await response.json();

    return Response.json(data);
  } catch (error) {
    console.error("❌ Ошибка при отправке SMS:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
