import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              О проекте
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-base text-gray-500 hover:text-gray-900 transition-colors">
                  Что такое LITRO
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-base text-gray-500 hover:text-gray-900 transition-colors">
                  Помощь
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Связаться с нами
            </h3>
            <ul className="space-y-4">
              <li className="text-base text-gray-500">
                8 800 333 27 37
              </li>
              <li className="text-base text-gray-500">
                support@litro.ru
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Скачать приложение
            </h3>
            <div className="flex justify-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-500 transition-colors">
                <span className="sr-only">App Store</span>
                <img src="https://via.placeholder.com/120x40" alt="App Store" className="h-10" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 transition-colors">
                <span className="sr-only">Google Play</span>
                <img src="https://via.placeholder.com/120x40" alt="Google Play" className="h-10" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright section */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-400">
            © 2025 LITRO. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;