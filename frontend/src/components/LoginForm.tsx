//@ts-nocheck
import React, { useState } from "react";
import { useLoginMutation } from "../app/services/userApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/user/userSlice";
import type { AppDispatch } from "../store";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Mail, Lock } from "lucide-react";
import { toast } from "react-toastify";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginForm: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await login({ email, password }).unwrap();
      
      if (!result.token) {
        toast.error("Ошибка: токен не получен от сервера", {
          position: "top-right",
        });
        return;
      }
      
      dispatch(setCredentials({
        user: result.user,
        token: result.token,
        mustChangePassword: result.mustChangePassword || false
      }));
      
      // Не показываем toast при принудительной смене пароля
      if (!result.mustChangePassword) {
        toast.success(`Добро пожаловать, ${result.user.email}! 🎉`, {
          position: "top-right",
        });
      }
      onClose(); // Закрываем модальное окно после успешного входа
    } catch (err: any) {
      toast.error(err.data?.error || "Ошибка входа", {
        position: "top-right",
      });
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    onClose();
  };

  return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-white border-2 border-gray-200 rounded-lg">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-[#213659] text-xl">
              Вход в систему
            </DialogTitle>
            <DialogDescription className="sr-only">
              Введите email и пароль для входа в систему
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#213659]">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A81A9] h-4 w-4" />
                <Input
                    id="email"
                    type="email"
                    placeholder="Введите email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-white border-[#B1D1E0] text-[#213659] focus:border-[#213659]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#213659]">
                Пароль
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A81A9] h-4 w-4" />
                <Input
                    id="password"
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 bg-white border-[#B1D1E0] text-[#213659] focus:border-[#213659]"
                />
              </div>
            </div>

            <Button
                type="submit"
                className="w-full bg-[#213659] hover:bg-[#1a2a4a] text-white"
                disabled={isLoading}
            >
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </form>

          <div className="text-center text-sm text-[#6A81A9] mt-4">
            <p>Нет аккаунта? Обратитесь к администратору</p>
          </div>
        </DialogContent>
      </Dialog>
  );
};