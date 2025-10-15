import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTelegram, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#213659] text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* О предприятии */}
          <div>
            <h3 className="text-lg font-semibold mb-4">О предприятии</h3>
            <p className="text-sm text-gray-300 mb-4">
              Республиканское унитарное предприятие по аэронавигационному обслуживанию воздушного движения «Белаэронавигация»
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaTelegram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0" />
                <span>г. Минск, ул. Короткевича, 19</span>
              </div>
              <div className="flex items-center gap-2">
                <FaPhone className="flex-shrink-0" />
                <a href="tel:+375171234567" className="hover:text-white transition-colors">
                  +375 (17) 123-45-67
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope className="flex-shrink-0" />
                <a href="mailto:info@belaeronavigation.by" className="hover:text-white transition-colors">
                  info@belaeronavigation.by
                </a>
              </div>
            </div>
          </div>

          {/* Полезные ссылки */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Полезные ссылки</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  О предприятии
                </Link>
              </li>
              <li>
                <Link to="/about/vacancies" className="hover:text-white transition-colors">
                  Вакансии
                </Link>
              </li>
              <li>
                <Link to="/about/contacts" className="hover:text-white transition-colors">
                  Контакты
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="hover:text-white transition-colors">
                  Политика использования cookie
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижняя часть футера */}
        <div className="border-t border-gray-600 pt-8 text-center text-sm text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} РУП «Белаэронавигация». Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}

