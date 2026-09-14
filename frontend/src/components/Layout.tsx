import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "./Header";
import { HeroVideoBanner } from "./HeroVideoBanner";
import { HomeNewsSection } from "./HomeNewsSection";
import { PageHeroImageStrip } from "./PageHeroImageStrip";
import { PageNavSidebar, shouldShowPageSidebar } from "./PageNavSidebar";
import { ContentContainer } from "./ContentContainer";
import { ToastContainer } from "react-toastify";
import CookieConsent from "./CookieConsent";
import Footer from "./Footer";
import { ForcePasswordChangeModal } from "./ForcePasswordChangeModal";
import { useSelector } from "react-redux";
import { isServicesPath } from "@/constants/homeServiceCards";

export const Layout = () => {
    const { mustChangePassword } = useSelector((state: any) => state.auth);
    const { pathname } = useLocation();
    const showServiceHeroStrip = isServicesPath(pathname);
    const showPageSidebar = shouldShowPageSidebar(pathname);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="flex flex-col min-h-screen relative z-10 bg-[var(--color-page-bg)]">
            <Header />
            <HeroVideoBanner />
            {pathname === "/" && <HomeNewsSection />}
            {showServiceHeroStrip && (
                <PageHeroImageStrip
                    src="/plain.jpg"
                    alt="Самолёт"
                />
            )}

            <div className="flex flex-1 flex-col overflow-x-hidden a11y-content">
                <ContentContainer className="flex-1">
                    {showPageSidebar ? (
                        <div className="page-layout">
                            <PageNavSidebar />
                            <div className="page-layout__main">
                                <Outlet />
                            </div>
                        </div>
                    ) : (
                        <Outlet />
                    )}
                </ContentContainer>
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
