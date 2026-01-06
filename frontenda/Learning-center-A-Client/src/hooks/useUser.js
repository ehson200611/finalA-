// "use client";

// import { useState, useEffect, useId } from "react";
// import { jwtDecode } from "jwt-decode";
// import { useGetUsersByIdQuery } from "@/store/slices/userAdminApi";

// export function useUser() {
//   const [userId, setUserId] = useState(null);
//   const [user, setUser] = useState(null);

//   // Декодируем токен (только client)
//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     const token = localStorage.getItem("token");
//     if (!token) return;

//     try {
//       const decoded = jwtDecode(token);
//       setUserId(decoded.user_id);
//       setUser(decoded);
//       console.log(decoded);
//     } catch (err) {
//       console.error("Invalid token:", err);
//     }
//   }, []);

//   // Загружаем пользователя по ID
//   const { data, isLoading, isError } = useGetUsersByIdQuery(userId, {
//     skip: !userId,
//   });

//   return {
//     users: user,
//     userId,
//     user: data ?? null,
//     isLoading,
//     isError,
//   };
// }
