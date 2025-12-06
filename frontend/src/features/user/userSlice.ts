import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "../../types/user";

const storedUser = (() => {
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? (JSON.parse(raw) as User) : null;
    return user;
  } catch {
    return null;
  }
})();

const initialState: AuthState = {
  user: storedUser,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  mustChangePassword: false,
};

const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; mustChangePassword?: boolean }>
    ) => {
      const { user, token, mustChangePassword = false } = action.payload;
      
      if (!token) {
        return;
      }
      
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.mustChangePassword = mustChangePassword;
      localStorage.setItem("token", token);
      try { localStorage.setItem("user", JSON.stringify(user)); } catch {}
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.mustChangePassword = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearMustChangePassword: (state) => {
      state.mustChangePassword = false;
    },
  },
});

export const { setCredentials, logout, setLoading, updateUser, clearMustChangePassword } = userSlice.actions;
export default userSlice.reducer; 