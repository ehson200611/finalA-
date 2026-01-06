// /app/api/pdf/route.js
export async function GET(req) {
  const url = decodeURIComponent(req.nextUrl.searchParams.get("url"));

  const response = await fetch(url);

  const buffer = await response.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline", // открывать, не скачивать
    },
  });
}
