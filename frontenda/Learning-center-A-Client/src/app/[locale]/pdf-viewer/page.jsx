"use client";
import { useEffect } from "react";

export default function PdfViewerPage() {
  const pdfUrl = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("url")
    : null;

  useEffect(() => {
    const handler = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handler);

    return () => {
      document.removeEventListener("contextmenu", handler);
    };
  }, []);

  if (!pdfUrl) return <div>PDF not found</div>;

  return (
    <iframe
      src={pdfUrl}
      className="w-full h-screen"
      style={{ border: "none" }}
    />
  );
}
