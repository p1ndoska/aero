import { configureStore } from "@reduxjs/toolkit";
import { api } from "../app/services/api";
import { userProfileApi } from "../app/services/userProfileApi";
import { uploadApi } from "../app/services/uploadApi";
import { resumeApi } from "../app/services/resumeApi";
import { aeronauticalInfoCategoryApi } from "../app/services/aeronauticalInfoCategoryApi";
import { appealsCategoryApi } from "../app/services/appealsCategoryApi";
import { servicesCategoryApi } from "../app/services/servicesCategoryApi";
import { heroImageApi } from "../app/services/heroImageApi";
import { searchApi } from "../app/services/searchApi";
import auth from "../features/user/userSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [userProfileApi.reducerPath]: userProfileApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    [resumeApi.reducerPath]: resumeApi.reducer,
    [aeronauticalInfoCategoryApi.reducerPath]: aeronauticalInfoCategoryApi.reducer,
    [appealsCategoryApi.reducerPath]: appealsCategoryApi.reducer,
    [servicesCategoryApi.reducerPath]: servicesCategoryApi.reducer,
    [heroImageApi.reducerPath]: heroImageApi.reducer,
    [searchApi.reducerPath]: searchApi.reducer,
    auth,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      api.middleware, 
      userProfileApi.middleware, 
      uploadApi.middleware,
      resumeApi.middleware,
      aeronauticalInfoCategoryApi.middleware,
      appealsCategoryApi.middleware,
      servicesCategoryApi.middleware,
      heroImageApi.middleware,
      searchApi.middleware
    ),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>; 