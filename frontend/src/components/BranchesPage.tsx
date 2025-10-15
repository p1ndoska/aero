import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useGetAllBranchesQuery } from '@/app/services/branchApi';
import { MapPin, Phone, Mail, Building2, Image as ImageIcon } from 'lucide-react';

export default function BranchesPage() {
  const { data: branchesResponse, isLoading, error } = useGetAllBranchesQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#213659] mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка информации о филиалах...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-red-600">
          <p>Ошибка загрузки данных о филиалах.</p>
          <p>Пожалуйста, попробуйте еще раз позже.</p>
        </div>
      </div>
    );
  }

  const branches = branchesResponse?.branches ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#213659] mb-2 flex items-center justify-center gap-3">
          <Building2 className="w-8 h-8" />
            Структурные подразделения
        </h1>
      </div>

      {!branches.length ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-lg">Филиалы не найдены</p>
          <p className="text-gray-500 text-sm">Данные будут добавлены в ближайшее время</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => {
            const mainImage = branch.images?.[0];

            return (
              <Card key={branch.id} className="hover:shadow-lg transition-shadow duration-300 border-[#B1D1E0] bg-white">
                <CardContent className="p-6">
                  {/* Фото филиала */}
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={branch.name}
                      className="w-full h-48 md:h-56 rounded-xl object-cover object-center mb-4 border-2 border-[#213659]"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {!mainImage && (
                    <div className="w-full h-48 md:h-56 rounded-xl bg-[#213659] mb-4 flex items-center justify-center border-2 border-[#213659]">
                      <ImageIcon className="w-10 h-10 text-white" />
                    </div>
                  )}
                  <Link to={`/about/branches/${branch.id}`} className="block">
                    <h3 className="text-xl font-bold text-[#213659] hover:underline">{branch.name}</h3>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


