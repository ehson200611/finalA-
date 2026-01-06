import React from "react";
import { AlertCircle, WifiOff, Server, RefreshCw } from "lucide-react";
import { Button } from "@mui/material";
import { useLocale, useTranslations } from "next-intl";

const Errors = ({
  error,
  onRetry,
  title,
  message,
  type = "auto",
  showRetryButton = true,
  className = "",
  fullScreen = false,
}) => {
  const locale = useLocale();
  const t = useTranslations("errors");

  // If no error, render nothing
  if (!error) return null;

  // Determine error type
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  const errorType = type === "auto" ? (isOnline ? "server" : "network") : type;

  // Get error details
  const errorDetails = {
    status: error?.status || "unknown",
    data: error?.data || {},
    message: error?.message || "",
  };

  // Get server message
  const getServerMessage = () => {
    if (message) return message;

    const serverMsg =
      errorDetails.data?.detail ||
      errorDetails.data?.message ||
      errorDetails.data?.error ||
      errorDetails.message ||
      t("unknownError");

    return serverMsg;
  };

  // Get error title - SIMPLIFIED: Only internet or server error
  const getErrorTitle = () => {
    if (title) return title;

    return errorType === "network" ? t("noInternet") : t("serverError");
  };

  // Get error icon - SIMPLIFIED: Only wifi icon for network, server icon for server
  const getErrorIcon = () => {
    return errorType === "network" ? (
      <WifiOff className="w-12 h-12 mb-4" />
    ) : (
      <Server className="w-12 h-12 mb-4" />
    );
  };

  // Get status code text with translations
  const getStatusCodeText = () => {
    const status = errorDetails.status;

    // Status code translations
    const statusTranslations = {
      400:
        locale === "ru"
          ? "400 - Неверный запрос"
          : locale === "tj"
          ? "400 - Дархости нодуруст"
          : "400 - Bad Request",
      401:
        locale === "ru"
          ? "401 - Неавторизован"
          : locale === "tj"
          ? "401 - Ғайрирасмӣ"
          : "401 - Unauthorized",
      403:
        locale === "ru"
          ? "403 - Запрещено"
          : locale === "tj"
          ? "403 - Манъ аст"
          : "403 - Forbidden",
      404:
        locale === "ru"
          ? "404 - Не найдено"
          : locale === "tj"
          ? "404 - Ёфт нашуд"
          : "404 - Not Found",
      500:
        locale === "ru"
          ? "500 - Внутренняя ошибка сервера"
          : locale === "tj"
          ? "500 - Хатогии дохилии сервер"
          : "500 - Internal Server Error",
      502:
        locale === "ru"
          ? "502 - Неверный шлюз"
          : locale === "tj"
          ? "502 - Шлюзи нодуруст"
          : "502 - Bad Gateway",
      503:
        locale === "ru"
          ? "503 - Сервис недоступен"
          : locale === "tj"
          ? "503 - Хизмат дастрас нест"
          : "503 - Service Unavailable",
      504:
        locale === "ru"
          ? "504 - Тайм-аут шлюза"
          : locale === "tj"
          ? "504 - Таймаути шлюз"
          : "504 - Gateway Timeout",
    };

    return statusTranslations[status] || `${status} - ${t("errorCode")}`;
  };

  // Render field-specific validation errors if they exist
  const renderValidationErrors = () => {
    if (!errorDetails.data?.errors) return null;

    const validationErrors = errorDetails.data.errors;

    return (
      <div className="mt-4 text-left">
        <p className="text-sm font-semibold mb-2">{t("validationIssues")}:</p>
        <ul className="space-y-1 text-sm">
          {Object.entries(validationErrors).map(([field, errors]) => (
            <li key={field} className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>
                <span className="font-medium">{field}:</span>{" "}
                {Array.isArray(errors) ? errors.join(", ") : errors}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // SIMPLIFIED error messages based on type
  const getTypeSpecificMessage = () => {
    if (message) return message;

    if (errorType === "network") {
      return locale === "ru"
        ? "Проверьте подключение к интернету и попробуйте снова"
        : locale === "tj"
        ? "Пайвасти интернетро санҷед ва бори дигар кӯшиш кунед"
        : "Please check your internet connection and try again";
    }

    // For server errors
    const serverMsg = getServerMessage();
    return serverMsg;
  };

  // Main error component
  const ErrorContent = () => (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 ${className}`}
    >
      {/* Icon */}
      <div className="text-red-500 mb-4">{getErrorIcon()}</div>

      {/* Title - Internet Error or Server Error */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        {getErrorTitle()}
      </h2>

      {/* Show status code only for server errors */}
      {errorType === "server" && errorDetails.status !== "unknown" && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {getStatusCodeText()}
        </p>
      )}

      {/* Type-specific message */}
      <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-md">
        {getTypeSpecificMessage()}
      </p>

      {/* Validation Errors (only for server errors) */}
      {errorType === "server" && renderValidationErrors()}


      {/* Retry Button */}
      {showRetryButton && onRetry && (
        <Button
          onClick={onRetry}
          startIcon={<RefreshCw className="w-4 h-4" />}
          variant="contained"
          color="primary"
          className="mt-6"
        >
          {t("retry")}
        </Button>
      )}
    </div>
  );

  // Render full screen or inline
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center z-50">
        <ErrorContent />
      </div>
    );
  }

  return <ErrorContent />;
};

// Default props
Errors.defaultProps = {
  type: "auto",
  showRetryButton: true,
  fullScreen: false,
};

export default Errors;
