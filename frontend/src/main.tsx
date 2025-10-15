// main.tsx или index.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "@/components/Layout.tsx";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Toaster } from "@/components/ui/sonner";
import {NewsCompany} from "@/components/NewsCompany.tsx";
import NewsCategoryPage from "@/components/news/NewsCategoryPage";
import CategoriesAdminPage from "@/components/admin/CategoriesAdminPage";
import NewsAllPage from "@/components/news/NewsAllPage";
import NewsCategoryByIdPage from "@/components/news/NewsCategoryByIdPage";
import SuperAdminDashboard from "@/components/admin/SuperAdminDashboard";
import ManagementPage from "@/components/ManagementPage";
import BranchesPage from "@/components/BranchesPage";
import BranchDetailsPage from "@/components/BranchDetailsPage";
import NewsDetailPage from "@/components/NewsDetailPage";
import VacanciesPage from "@/components/VacanciesPage";
import VacancyManagement from "@/components/admin/VacancyManagement";
import CookiePolicyPage from "@/components/CookiePolicyPage";
import UserProfile from "@/components/UserProfile";
import HistoryPage from "@/components/HistoryPage";
import AboutCompanyPage from "@/components/AboutCompanyPage";
import SecurityPolicyPage from "@/components/SecurityPolicyPage";
import TradeUnionPage from "@/components/social/TradeUnionPage";
import BelayaRusPage from "@/components/social/BelayaRusPage";
import BRSMPage from "@/components/social/BRSMPage";
import WomenUnionPage from "@/components/social/WomenUnionPage";
import HealthyLifestylePage from "@/components/social/HealthyLifestylePage";
import ImprovementYearPage from "@/components/social/ImprovementYearPage";
import MemoryPage from "@/components/social/MemoryPage";
import DynamicPage from "@/components/DynamicPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <App /> },
            { path: "/news", element: <NewsAllPage /> },
            { path: "/news/:id", element: <NewsDetailPage /> },
            { path: "/news/category/:id", element: <NewsCategoryByIdPage /> },
            { path: "/news/company", element: <NewsCompany/> },
            { path: "/news/flight-safety", element: <NewsCategoryPage title="Безопасность Полетов" categoryName="Безопасность полетов" /> },
            { path: "/news/information-security", element: <NewsCategoryPage title="Информационная Безопасность" categoryName="Информационная безопасность" /> },
            { path: "/news/emergency", element: <NewsCategoryPage title="МЧС информирует" categoryName="МЧС информирует" /> },
            { path: "/news/police", element: <NewsCategoryPage title="МВД информирует" categoryName="МВД информирует" /> },
            { path: "/news/energy-saving", element: <NewsCategoryPage title="Энергосбережение" categoryName="Энергосбережение" /> },
            { path: "/about/management", element: <ManagementPage /> },
            { path: "/about/branches", element: <BranchesPage /> },
            { path: "/about/branches/:id", element: <BranchDetailsPage /> },
            { path: "/about/history", element: <HistoryPage /> },
            { path: "/about/company", element: <AboutCompanyPage /> },
            { path: "/about/security-policy", element: <SecurityPolicyPage /> },
            { path: "/about/vacancies", element: <VacanciesPage /> },
            { path: "/about/:pageType", element: <DynamicPage pageType="about" /> },
            { path: "/social/trade-union", element: <TradeUnionPage /> },
            { path: "/social/belaya-rus", element: <BelayaRusPage /> },
            { path: "/social/brsm", element: <BRSMPage /> },
            { path: "/social/women-union", element: <WomenUnionPage /> },
            { path: "/social/healthy-lifestyle", element: <HealthyLifestylePage /> },
            { path: "/social/improvement-year", element: <ImprovementYearPage /> },
            { path: "/social/memory", element: <MemoryPage /> },
            { path: "/social/:pageType", element: <DynamicPage pageType="social" /> },
            { path: "/air-navigation/:pageType", element: <DynamicPage pageType="aeronautical" /> },
            { path: "/appeals/:pageType", element: <DynamicPage pageType="appeals" /> },
            { path: "/cookie-policy", element: <CookiePolicyPage /> },
            { path: "/profile", element: <UserProfile /> },
            { path: "/admin/news/categories", element: <CategoriesAdminPage /> },
            { path: "/admin/vacancies", element: <VacancyManagement /> },
            { path: "/admin", element: <SuperAdminDashboard /> },
        ],
    },
]);

const root = document.getElementById("root")!;

createRoot(root).render(
    <StrictMode>
        <Provider store={store}>
            <LanguageProvider>
                <RouterProvider router={router} />
                <Toaster />
            </LanguageProvider>
        </Provider>
    </StrictMode>
);
