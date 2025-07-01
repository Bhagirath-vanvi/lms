import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authSlice from "./slices/authSlice";
import courseSlice from "./slices/courseSlice";
import uiSlice from "./slices/uiSlice";
import { apiSlice } from "./api/apiSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    courses: courseSlice,
    ui: uiSlice,
    api: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

export default store;
