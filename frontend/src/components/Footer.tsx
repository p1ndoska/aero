import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#213659] text-white py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Контакты */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('contacts')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <FaPhone className="mr-2" size={14} />
              <span>+375 (17) 215-40-52</span>
            </div>
            <div className="flex items-center">
              <FaPhone className="mr-2" size={14} />
              <span>+375 (17) 213-41-63 (факс)</span>
            </div>
            <div className="flex items-center">
              <FaEnvelope className="mr-2" size={14} />
              <span>office@ban.by</span>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-2" size={14} />
              <span>{t('address')}: {t('minsk_address')}</span>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-2 opacity-0" size={14} />
              <span>{t('working_hours')}: {t('working_time')}</span>
            </div>
          </div>
        </div>

        {/* Полезные ссылки */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('useful_links')}</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:underline transition-colors">
                {t('about_company')}
              </Link>
            </li>
            <li>
              <Link to="/about/vacancies" className="hover:underline transition-colors">
                {t('open_vacancies') || t('vacancies')}
              </Link>
            </li>
            <li>
              <Link to="/about/branches" className="hover:underline transition-colors">
                {t('contacts')}
              </Link>
            </li>
            <li>
              <Link to="/cookie-policy" className="hover:underline transition-colors">
                {t('cookie_policy')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Copyright */}
        <div className="md:col-span-3 text-center pt-8 border-t border-gray-700 mt-8">
          <p className="text-sm">© 2025 {t('company_name_short')}. {t('all_rights_reserved')}.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

