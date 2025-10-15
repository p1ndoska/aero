import { configureStore } from "@reduxjs/toolkit";
import { api } from "../app/services/api";
import { userProfileApi } from "../app/services/userProfileApi";
import { uploadApi } from "../app/services/uploadApi";
import { aeronauticalInfoCategoryApi } from "../app/services/aeronauticalInfoCategoryApi";
import { appealsCategoryApi } from "../app/services/appealsCategoryApi";
import { servicesCategoryApi } from "../app/services/servicesCategoryApi";
import auth from "../features/user/userSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [userProfileApi.reducerPath]: userProfileApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    [aeronauticalInfoCategoryApi.reducerPath]: aeronauticalInfoCategoryApi.reducer,
    [appealsCategoryApi.reducerPath]: appealsCategoryApi.reducer,
    [servicesCategoryApi.reducerPath]: servicesCategoryApi.reducer,
    auth,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      api.middleware, 
      userProfileApi.middleware, 
      uploadApi.middleware,
      aeronauticalInfoCategoryApi.middleware,
      appealsCategoryApi.middleware,
      servicesCategoryApi.middleware
    ),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>; 