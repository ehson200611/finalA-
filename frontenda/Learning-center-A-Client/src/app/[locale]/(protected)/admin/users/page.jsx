"use client";
import React, { useEffect, useState } from "react";
import { Search, User, Calendar, Shield, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import {
  useGetUsersAdminQuery,
  useUpdateUserRoleMutation,
  useCreateUserMutation,
  useToggleIsPdfMutation,
} from "@/store/slices/userAdminApi";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import Loading from "@/components/loading/loading";
import { PictureAsPdf } from "@mui/icons-material";

const parseJoinDate = (raw) => {
  if (!raw) return null;
  let s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
    s = s.replace(" ", "T");
  }
  const d = new Date(s);
  if (isNaN(d.getTime())) {
    const maybeIso = s + "Z";
    const d2 = new Date(maybeIso);
    if (!isNaN(d2.getTime())) return d2;
    return null;
  }
  return d;
};

const Users = () => {
  const { data: meProfile } = useGetMeProfileQuery();
  const isAdmin = meProfile?.role === "superadmin";

  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    phoneNumber: "",
    role: "user",
  });

  // RTK Query hooks
  const { data: users, isLoading, error, refetch } = useGetUsersAdminQuery();
  console.log(users);

  const [updateUserRole, { isLoading: isUpdating }] =
    useUpdateUserRoleMutation();
  const [toggleIsPdf, { isLoading: toggleIsPdfing }] = useToggleIsPdfMutation();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const t = useTranslations("usersAdmin");

  useEffect(() => setMounted(true), []);
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

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const toggleUserRole = async (id, currentRole) => {
    try {
      const newRole = currentRole === "user" ? "admin" : "user";
      await updateUserRole({ id, role: newRole }).unwrap();
    } catch (err) {
      console.error("Failed to update user role:", err);
    }
  };

  const ftoggleIsPdf = async (user) => {
    try {
      const body = {
        phone: "string",
        status: "active",
        is_pdf: user.is_pdf ? false : true,
      };
      await toggleIsPdf({ id: user?.id, body }).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  // Add User Functions
  const handleOpenAddUserDialog = () => {
    setAddUserDialogOpen(true);
  };

  const handleCloseAddUserDialog = () => {
    setAddUserDialogOpen(false);
    setNewUser({
      name: "",
      phoneNumber: "",
      role: "user",
    });
  };

  const handleInputChange = (field, value) => {
    setNewUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Функция для получения текущей даты в формате "YYYY-MM-DD HH:MM:SS"
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleAddUser = async () => {
    // Validation (только обязательные поля)
    if (!newUser.name.trim()) {
      alert(t("enterUserName"));
      return;
    }
    if (!newUser.phoneNumber.trim()) {
      alert(t("enterPhone"));
      return;
    }

    try {
      // Добавляем текущую дату и время к данным пользователя
      const userDataWithDate = {
        ...newUser,
        joinDate: getCurrentDateTime(), // Автоматически добавляем текущую дату
      };

      await createUser(userDataWithDate).unwrap();

      // Success
      handleCloseAddUserDialog();
      refetch(); // Refresh the user list
    } catch (err) {
      console.error("Failed to create user:", err);
      alert(
        `${t("failedCreateUser")}: ${
          err.data?.message || err.message || t("unknownError")
        }`
      );
    }
  };

  const formatJoinDate = (raw) => {
    const d = parseJoinDate(raw);
    if (!d) return { date: "-", time: "" };
    return {
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString(),
    };
  };

  const isDark = theme === "dark";

  // Стили для TextField
  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      color: isDark ? "white" : "#101828",
      "& fieldset": {
        borderColor: isDark ? "#374151" : "#cbd5e1",
      },
      "&:hover fieldset": {
        borderColor: isDark ? "#60a5fa" : "#3b82f6",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#3b82f6",
      },
    },
    "& .MuiInputLabel-root": {
      color: isDark ? "#9ca3af" : "#6b7280",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#3b82f6",
    },
    "& .MuiOutlinedInput-input": {
      backgroundColor: isDark ? "transparent" : "white",
      color: isDark ? "white" : "#101828",
    },
    "& .MuiInputBase-input::placeholder": {
      color: isDark ? "#6b7280" : "#9ca3af",
      opacity: 1,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className=" flex flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            } flex items-center gap-2`}
          >
            <User className="w-6 h-6" />
            {t("usersManagement")}
          </h1>
          <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {t("manageUsersDesc")}
          </p>
        </div>

        {/* Stats Cards */}
        <div
          className={`rounded-xl p-4 border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <p
            className={`text-2xl font-bold flex justify-between gap-3 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            <User size={32} className=" text-blue-500" />
            <span className="text-2xl">{users?.length - 2}</span>
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        className={`rounded-xl p-4 border ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder={t("searchUsers")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">{t("allRoles")}</option>
              <option value="user">{t("regularUser")}</option>
              <option value="admin">{t("admin")}</option>
            </select>
          </div>

          <div className="">
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={handleOpenAddUserDialog}
              sx={{
                backgroundColor: "#3b82f6",
                color: "white",
                "&:hover": {
                  backgroundColor: "#2563eb",
                },
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              {t("addUser")}
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div
        className={`rounded-xl border overflow-hidden ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  #
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {t("user")}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {t("role")}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {t("phoneNumber")}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {t("joinDate")}
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider  ${
                    isAdmin ? "cursor-pointer" : "hidden"
                  } ${isDark ? "text-gray-300" : "text-gray-500"}`}
                >
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? "divide-gray-600" : "divide-gray-200"
              }`}
            >
              {filteredUsers?.length > 0 ? (
                filteredUsers?.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`transition-colors
                      ${user.role == "superadmin" ? "hidden" : ""}
                      ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-medium truncate ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {user.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            {t("admin")}
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            {t("user")}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {user.phoneNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        {new Date(user.joinDate).toLocaleDateString()}
                      </div>
                      <span
                        className={`text-xs ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {new Date(user.joinDate).toLocaleTimeString()}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className={`px-6 py-4`}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => toggleUserRole(user.id, user.role)}
                            disabled={isUpdating}
                            className={`p-2 rounded-lg transition-colors  ${
                              user.role === "admin"
                                ? "text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                                : "text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                            } ${
                              isUpdating ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            title={
                              user.role === "admin"
                                ? t("makeRegularUser")
                                : t("makeAdmin")
                            }
                          >
                            <Shield className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => ftoggleIsPdf(user)}
                            className={`${
                              user?.is_pdf ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            <PictureAsPdf />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-24 text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p
                      className={`text-lg font-medium ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {t("noUsersFound")}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {searchTerm || roleFilter !== "all"
                        ? t("adjustFilters")
                        : t("noUsers")}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog
        open={addUserDialogOpen}
        onClose={handleCloseAddUserDialog}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: isDark ? "#0a1a23" : "white",
            color: isDark ? "white" : "#101828",
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: isDark ? "white" : "#101828",
            backgroundColor: isDark ? "#0a1a23" : "white",
            borderBottom: isDark ? "1px solid #1e3a4a" : "1px solid #e5e7eb",
            fontSize: "1.25rem",
            fontWeight: "600",
          }}
        >
          {t("addNewUser")}
        </DialogTitle>

        <DialogContent
          sx={{
            backgroundColor: isDark ? "#0a1a23" : "white",
            pt: 3,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label={t("fullName")}
              value={newUser.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              fullWidth
              variant="outlined"
              sx={textFieldStyles}
              placeholder={t("enterFullName")}
            />

            <TextField
              label={t("phoneNumber")}
              value={newUser.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              fullWidth
              variant="outlined"
              sx={textFieldStyles}
              placeholder={t("enterPhoneNumber")}
            />

            <FormControl fullWidth>
              <InputLabel
                sx={{
                  color: isDark ? "#9ca3af" : "#6b7280",
                  "&.Mui-focused": {
                    color: "#3b82f6",
                  },
                }}
              >
                {t("role")}
              </InputLabel>
              <Select
                value={newUser.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                label={t("role")}
                sx={{
                  color: isDark ? "white" : "#101828",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDark ? "#374151" : "#cbd5e1",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDark ? "#60a5fa" : "#3b82f6",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#3b82f6",
                  },
                  "& .MuiSelect-icon": {
                    color: isDark ? "#9ca3af" : "#6b7280",
                  },
                  "& .MuiSelect-select": {
                    backgroundColor: isDark ? "transparent" : "white",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: isDark ? "#0a1a23" : "white",
                      color: isDark ? "white" : "#101828",
                      "& .MuiMenuItem-root": {
                        "&:hover": {
                          backgroundColor: isDark ? "#1e3a4a" : "#f3f4f6",
                        },
                        "&.Mui-selected": {
                          backgroundColor: isDark ? "#3b82f6" : "#3b82f6",
                          color: "white",
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="user">{t("regularUser")}</MenuItem>
                <MenuItem value="admin">{t("admin")}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            gap: 1,
            backgroundColor: isDark ? "#0a1a23" : "white",
            borderTop: isDark ? "1px solid #1e3a4a" : "1px solid #e5e7eb",
          }}
        >
          <Button
            onClick={handleCloseAddUserDialog}
            variant="outlined"
            sx={{
              color: isDark ? "#9ca3af" : "#6b7280",
              borderColor: isDark ? "#374151" : "#cbd5e1",
              "&:hover": {
                borderColor: isDark ? "#60a5fa" : "#3b82f6",
                backgroundColor: isDark
                  ? "rgba(96, 165, 250, 0.1)"
                  : "rgba(59, 130, 246, 0.1)",
              },
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            disabled={isCreating}
            startIcon={isCreating ? <CircularProgress size={16} /> : null}
            sx={{
              backgroundColor: "#3b82f6",
              color: "white",
              "&:hover": {
                backgroundColor: "#2563eb",
              },
              "&:disabled": {
                backgroundColor: "#9ca3af",
              },
            }}
          >
            {isCreating ? t("creating") : t("createUser")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Users;
