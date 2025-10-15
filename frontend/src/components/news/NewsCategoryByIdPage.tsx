//@ts-nocheck
import React from "react";
import { useParams } from "react-router-dom";
import NewsCategoryPage from "./NewsCategoryPage";
import { useGetCategoriesQuery } from "@/app/services/categoryApi";

// This wrapper resolves category name by id to reuse NewsCategoryPage UI
export default function NewsCategoryByIdPage() {
    const { id } = useParams();
    const categoryId = Number(id);
    const { data: categories } = useGetCategoriesQuery();

    const category = Array.isArray(categories) ? categories.find((c: any) => c.id === categoryId) : null;
    const title = category?.name || "Новости категории";

    // We reuse NewsCategoryPage with name filtering so title matches and actions are consistent
    return <NewsCategoryPage title={title} categoryName={category?.name || ""} />;
} 