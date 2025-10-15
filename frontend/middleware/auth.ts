import { createListenerMiddleware } from "@reduxjs/toolkit";
import { setCredentials, logout } from "../src/features/user/userSlice";

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: setCredentials,
  effect: (action) => {
    // Можно добавить дополнительную логику при успешном входе
    console.log("User logged in:", action.payload.user.email);
  },
});

listenerMiddleware.startListening({
  actionCreator: logout,
  effect: () => {
    // Можно добавить дополнительную логику при выходе
    console.log("User logged out");
  },
});
