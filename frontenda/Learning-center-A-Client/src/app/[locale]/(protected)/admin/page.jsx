"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Eye,
  EyeOff,
  Trash2,
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  useGetNotificationAdminQuery,
  useMarkAsReadMutation,
  useMarkAsUnreadMutation,
  useDeleteNotificationMutation,
} from "@/store/slices/notificationAdminApi";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import Loading from "@/components/loading/loading";

const NotificationPage = () => {
  const { data: meProfile } = useGetMeProfileQuery();
  const isAdmin = meProfile?.role === "superadmin";

  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("notification");
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useGetNotificationAdminQuery();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const openDialog = (id) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };

  const closeDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedId(null);
  };

  const [markAsRead, { isLoading: isMarkingRead, error: markReadError }] =
    useMarkAsReadMutation();
  const [markAsUnread, { isLoading: isMarkingUnread, error: markUnreadError }] =
    useMarkAsUnreadMutation();
  const [deleteNotification, { isLoading: isDeleting, error: deleteError }] =
    useDeleteNotificationMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setMounted(true);

    // Log any mutation errors
    if (markReadError) console.error("Mark as read error:", markReadError);
    if (markUnreadError)
      console.error("Mark as unread error:", markUnreadError);
    if (deleteError) console.error("Delete error:", deleteError);
  }, [markReadError, markUnreadError, deleteError]);

  if (!mounted) return null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  if (error) {
    // 1. Проверяем интернет
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    // 2. Определяем тип ошибки
    let title = "";
    if (!isOnline) {
      title = t("noInternet");
    } else {
      title = t("serverError");
    }

    // 3. Получаем сообщение сервера если есть
    const serverMessage =
      error?.data?.detail ||
      error?.data?.message ||
      error?.message ||
      t("unknownError");

    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center text-center text-red-600 gap-2">
          <div className="text-3xl">⚠️</div>

          {/* Заголовок */}
          <p className="text-xl font-semibold">{title}</p>

          {/* Сообщение сервера */}
          <p className="text-sm text-red-500 max-w-xs">{serverMessage}</p>

          {/* Сообщение браузера (для дебага) */}
          <p className="text-xs text-gray-500 mt-2">
            {t("errorCode")}: {error.status || t("noData")}
          </p>
        </div>
      </div>
    );
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification?.phoneNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || notification.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleMarkAsRead = async (id) => {
    try {
      const result = await markAsRead(id).unwrap();
    } catch (error) {
      console.error("Failed to mark as read:", error);
      console.error("Error details:", {
        status: error?.status,
        data: error?.data,
        message: error?.message,
      });
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      const result = await markAsUnread(id).unwrap();
    } catch (error) {
      console.error("Failed to mark as unread:", error);
      console.error("Error details:", {
        status: error?.status,
        data: error?.data,
        message: error?.message,
      });
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const result = await deleteNotification(id).unwrap();
    } catch (error) {
      console.error("Failed to delete notification:", error);
      console.error("Error details:", {
        status: error?.status,
        data: error?.data,
        message: error?.message,
      });
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status) => {
    return status === "unread" ? (
      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
        {t("unread")}
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
        {t("read")}
      </span>
    );
  };

  const isAnyActionLoading = isMarkingRead || isMarkingUnread || isDeleting;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            } flex items-center gap-2`}
          >
            <Bell className="w-6 h-6" />
            {t("notifications")}
          </h1>
          <p
            className={`${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            } mt-1`}
          >
            {t("notificationsDescription")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
          <div
            className={`${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-xl p-4 border`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("total")}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {notifications.length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div
            className={`${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-xl p-4 border`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("unread")}
                </p>
                <p className="text-2xl font-bold text-red-500">
                  {notifications.filter((n) => n.status === "unread").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      <div
        className={` ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }  rounded-xl p-4 border  `}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder={t("searchNotifications")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }   rounded-lg    focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 border ${
                theme === "dark"
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }   rounded-lg  focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="all">{t("allStatus")}</option>
              <option value="read">{t("read")}</option>
              <option value="unread">{t("unread")}</option>
            </select>
          </div>
        </div>
      </div>

      <div
        className={` ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200 "
        }  rounded-xl border  overflow-hidden`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className={` ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} `}
            >
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium  ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500 "
                  } uppercase tracking-wider`}
                >
                  {t("notification")}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium  ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500 "
                  } uppercase tracking-wider`}
                >
                  Phone Number
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium  ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500 "
                  } uppercase tracking-wider`}
                >
                  {t("status")}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium  ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500 "
                  } uppercase tracking-wider`}
                >
                  {t("date")}
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                theme === "dark" ? "divide-gray-600" : "divide-gray-200"
              }`}
            >
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className={` ${
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                    } transition-colors ${
                      notification.status === "unread"
                        ? ` ${
                            theme === "dark" ? "bg-blue-900/20" : "bg-blue-50"
                          } `
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {getTypeIcon(notification.type)}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            } truncate`}
                          >
                            {notification.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        } truncate`}
                      >
                        {notification.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(notification.status)}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      } `}
                    >
                      {new Date(notification.date).toLocaleDateString()} <br />
                      <span className="text-xs">
                        {new Date(notification.date).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {notification.status === "unread" ? (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={isAnyActionLoading}
                            className={`p-2 text-blue-600 ${
                              theme === "dark"
                                ? "hover:bg-blue-900/30"
                                : "hover:bg-blue-50"
                            } rounded-lg transition-colors ${
                              isAnyActionLoading
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            title={t("markAsReadText")}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkAsUnread(notification.id)}
                            disabled={isAnyActionLoading}
                            className={`p-2 text-gray-600 ${
                              theme === "dark"
                                ? "hover:bg-gray-900/30"
                                : "hover:bg-gray-50"
                            } rounded-lg transition-colors ${
                              isAnyActionLoading
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            title={t("markAsUnread")}
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => openDialog(notification.id)}
                            disabled={isAnyActionLoading}
                            className={`p-2 text-red-600 ${
                              theme === "dark"
                                ? "hover:bg-red-900/30"
                                : "hover:bg-red-50"
                            } rounded-lg transition-colors ${
                              isAnyActionLoading
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            title={t("deleteNotificationText")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-24 text-center">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p
                      className={` ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      } text-lg font-medium`}
                    >
                      {t("noNotificationsFound")}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {searchTerm || statusFilter !== "all"
                        ? t("adjustFiltersMessage")
                        : t("noNotifications")}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Dialog open={openDeleteDialog} onClose={closeDialog}>
        <DialogTitle>{t("deleteNotification")}</DialogTitle>

        <DialogContent>
          <DialogContentText>
            {t("confirmDeleteNotification")}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>{t("cancelText")}</Button>

          <Button
            onClick={async () => {
              await handleDeleteNotification(selectedId);
              closeDialog();
            }}
            color="error"
            autoFocus
          >
            {t("deleteText")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NotificationPage;
