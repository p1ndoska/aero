// Layout.tsx
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { ToastContainer } from "react-toastify";
import CookieConsent from "./CookieConsent";
import Footer from "./Footer";
import { ForcePasswordChangeModal } from "./ForcePasswordChangeModal";
import { useSelector } from "react-redux";


export const Layout = () => {
    const { mustChangePassword } = useSelector((state: any) => state.auth);

    return (
        <div className="flex flex-col min-h-screen relative z-10 bg-[url('/sky-bg.jpg')] bg-cover bg-center">
            <Header />

            <div className="flex flex-1 flex-col overflow-x-hidden a11y-content">
                <div className="w-full px-4 sm:px-6 lg:px-8 flex-1">
                    <Outlet />
                </div>
                <Footer />
            </div>

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
            
            <CookieConsent />
            
            {mustChangePassword && <ForcePasswordChangeModal isOpen={true} />}
        </div>
    );
};