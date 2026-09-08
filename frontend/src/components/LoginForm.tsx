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

import { Mail, Lock as LockIcon, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginForm: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    setShowPassword(false);
    onClose();
  };

  return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-white border-2 border-gray-200 rounded-lg">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-[var(--color-primary)] text-xl">
              Вход в систему
            </DialogTitle>
            <DialogDescription className="sr-only">
              Введите email и пароль для входа в систему
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--color-primary)]">
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
                    className="pl-10 bg-white border-[#B1D1E0] text-[var(--color-primary)] focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--color-primary)]">
                Пароль
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A81A9] h-4 w-4" />
                <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 bg-white border-[#B1D1E0] text-[var(--color-primary)] focus:border-[var(--color-primary)]"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A81A9] hover:text-[var(--color-primary)]"
                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
                type="submit"
                className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
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