import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/store/slices/auth";
import { teacherApi } from "./slices/teacherApi";
import { testApi } from "@/store/slices/testApi";
import { homePageApi } from "./slices/home";
import { coursesApi } from "./slices/coursesApi";
import { contactApi } from "./slices/contactApi";
import { faqApi } from "./slices/faqApi";
import { vacancyApi } from "./slices/vacancyApi";
import { testAdminApi } from "./slices/testAdminApi";
import { superAdminApi } from "./slices/superAdminApi";
import { notificationAdminApi } from "./slices/notificationAdminApi";
import { userAdminApi } from "./slices/userAdminApi";
import { aboutApi } from "./slices/aboutApi";
import { booksApi } from "@/store/slices/booksApi";
import { blogsApi } from "./slices/blogsApi";
import { feedbackApi } from "./slices/feedbackApi";
import { profileApi } from "@/store/slices/profile";
import { vacancyWorkApi } from "./slices/vacancyWorksApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [teacherApi.reducerPath]: teacherApi.reducer,
    [testApi.reducerPath]: testApi.reducer,
    [homePageApi.reducerPath]: homePageApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [faqApi.reducerPath]: faqApi.reducer,
    [vacancyApi.reducerPath]: vacancyApi.reducer,
    [userAdminApi.reducerPath]: userAdminApi.reducer,
    [testAdminApi.reducerPath]: testAdminApi.reducer,
    [superAdminApi.reducerPath]: superAdminApi.reducer,
    [notificationAdminApi.reducerPath]: notificationAdminApi.reducer,
    [aboutApi.reducerPath]: aboutApi.reducer,
    [booksApi.reducerPath]: booksApi.reducer,
    [blogsApi.reducerPath]: blogsApi.reducer,
    [feedbackApi.reducerPath]: feedbackApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [vacancyWorkApi.reducerPath]: vacancyWorkApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(teacherApi.middleware)
      .concat(testApi.middleware)
      .concat(homePageApi.middleware)
      .concat(coursesApi.middleware)
      .concat(contactApi.middleware)
      .concat(faqApi.middleware)
      .concat(vacancyApi.middleware)
      .concat(userAdminApi.middleware)
      .concat(testAdminApi.middleware)
      .concat(superAdminApi.middleware)
      .concat(notificationAdminApi.middleware)
      .concat(aboutApi.middleware)
      .concat(booksApi.middleware)
      .concat(blogsApi.middleware)
      .concat(feedbackApi.middleware)
      .concat(profileApi.middleware)
      .concat(vacancyWorkApi.middleware)
});

export default store;
