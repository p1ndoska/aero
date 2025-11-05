// Layout.tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import CookieConsent from "./CookieConsent";
import Footer from "./Footer";


export const Layout = () => {
    // Анимация для сайдбара
    const sidebarVariants = {
        hidden: { x: -280 }, // Сайдбар скрыт (за пределами экрана слева)
        visible: { x: 0 },   // Сайдбар на месте
    };

    return (
        <div className="flex flex-col min-h-screen relative z-10 bg-[url('/sky-bg.jpg')] bg-cover bg-center">
            <div className="flex flex-1">
                {/* Десктопный сайдбар (слева, всегда виден) */}
                <div className="hidden min-[951px]:block w-[260px] flex-shrink-0">
                    <Sidebar />
                </div>

                {/* Основной контент и футер */}
                <div className="flex-1 flex flex-col overflow-x-hidden">
                    <div className="w-full px-4 sm:px-6 lg:px-8 flex-1">
                        <Outlet />
                    </div>
                    
                    {/* Футер на ширине контентного блока */}
                    <div className="min-[951px]:ml-0">
                        <Footer />
                    </div>
                </div>
            </div>

            {/* Мобильный сайдбар (появляется при ширине <951px) */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={sidebarVariants}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="min-[951px]:hidden w-80 fixed inset-y-0 left-0 z-50"
            >
                <Sidebar />
            </motion.div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            
            {/* Баннер согласия на cookie */}
            <CookieConsent />
        </div>

    );
};