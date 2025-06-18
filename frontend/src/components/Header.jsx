import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingCart, Book, Gift, Heart, Star } from 'lucide-react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (location.pathname === '/books') {
      const params = new URLSearchParams(location.search);
      const q = params.get('q') || "";
      setQuery(q);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsMobileMenuOpen(false);
    window.location.href = '/';
  };

  const handleSearch = () => {
    const trimmed = query.trim();
    navigate(`/books${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ''}`);
    setIsMobileMenuOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isAuthor = user && (user.id_role === 4 || (user.role && user.role.toLowerCase() === 'автор'));
  const isAuthorizedForCart = user && user.id_role !== 3;
  const isAdmin = user && user.id_role === 1;

  return (
    <header className="bg-white shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
              <Book className="h-8 w-8 text-orange-500" />
              {!isAdmin && (
                <>
                  <span className="ml-2 text-xl font-bold text-gray-900">LITRO</span>
                  <p className="text-gray-500 ml-1">Книги от современных авторов</p>
                </>
              )}
              {isAdmin && (
                <span className="ml-2 text-xl font-bold text-gray-900">LITRO</span>
              )}
            </Link>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Книга или автор"
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-orange-500 transition-colors"
                type="button"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-4">
            <Link 
              to="/groups" 
              className="text-gray-700 hover:text-orange-500 transition-colors whitespace-nowrap"
            >
              Книги недели
            </Link>
            
            {isAuthorizedForCart && !isAdmin && (
              <Link 
                to="/cart" 
                className="text-gray-700 hover:text-orange-500 flex items-center transition-colors"
              >
                <ShoppingCart className="h-5 w-5 mr-1" />
                <span className="hidden xl:inline">Корзина</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
                >
                  Мой профиль
                </Link>
                {isAuthor && (
                  <Link
                    to="/upload-book"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
                  >
                    Загрузить книгу
                  </Link>
                )}
                {isAdmin && (
                  <>
                    <Link
                      to="/upload-book-admin"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Загрузить книгу (админ)
                    </Link>
                    <Link
                      to="/add-genre-admin"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                    >
                      Добавить жанр
                    </Link>
                    <Link
                      to="/report"
                      className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
                    >
                      Отчетность
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Войти
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-orange-500 hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Desktop category navigation */}
        <div className="hidden md:flex py-4 space-x-6 border-t border-gray-100">
          <Link 
            to="/books" 
            className="text-gray-700 hover:text-orange-500 flex items-center transition-colors"
          >
            <Book className="h-4 w-4 mr-2" />
            Книги
          </Link>
          <Link 
            to="/free" 
            className="text-gray-700 hover:text-orange-500 flex items-center transition-colors"
          >
            <Gift className="h-4 w-4 mr-2" />
            Бесплатные книги
          </Link>
          <Link 
            to="/top" 
            className="text-gray-700 hover:text-orange-500 flex items-center transition-colors"
          >
            <Heart className="h-4 w-4 mr-2" />
            Топ книг
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Книга или автор"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-orange-500 transition-colors"
                type="button"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile navigation links */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <Link 
                to="/books" 
                className="flex items-center py-2 text-gray-700 hover:text-orange-500 transition-colors"
                onClick={closeMobileMenu}
              >
                <Book className="h-5 w-5 mr-3" />
                Книги
              </Link>
              <Link 
                to="/free" 
                className="flex items-center py-2 text-gray-700 hover:text-orange-500 transition-colors"
                onClick={closeMobileMenu}
              >
                <Gift className="h-5 w-5 mr-3" />
                Бесплатные книги
              </Link>
              <Link 
                to="/top" 
                className="flex items-center py-2 text-gray-700 hover:text-orange-500 transition-colors"
                onClick={closeMobileMenu}
              >
                <Heart className="h-5 w-5 mr-3" />
                Топ книг
              </Link>
              <Link 
                to="/groups" 
                className="flex items-center py-2 text-gray-700 hover:text-orange-500 transition-colors"
                onClick={closeMobileMenu}
              >
                <Star className="h-5 w-5 mr-3" />
                Книги недели
              </Link>
              
              {isAuthorizedForCart && !isAdmin && (
                <Link 
                  to="/cart" 
                  className="flex items-center py-2 text-gray-700 hover:text-orange-500 transition-colors"
                  onClick={closeMobileMenu}
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Корзина
                </Link>
              )}
            </div>

            {/* Mobile user actions */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="block w-full bg-orange-500 text-white text-center px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Мой профиль
                  </Link>
                  {isAuthor && (
                    <Link
                      to="/upload-book"
                      className="block w-full bg-green-500 text-white text-center px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Загрузить книгу
                    </Link>
                  )}
                  {isAdmin && (
                    <>
                      <Link
                        to="/upload-book-admin"
                        className="block w-full bg-blue-600 text-white text-center px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={closeMobileMenu}
                      >
                        Загрузить книгу (админ)
                      </Link>
                      <Link
                        to="/add-genre-admin"
                        className="block w-full bg-indigo-600 text-white text-center px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                        onClick={closeMobileMenu}
                      >
                        Добавить жанр
                      </Link>
                      <Link
                        to="/report"
                        className="block w-full bg-amber-600 text-white text-center px-4 py-3 rounded-lg hover:bg-amber-700 transition-colors"
                        onClick={closeMobileMenu}
                      >
                        Отчетность
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Войти
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={closeMobileMenu}
        />
      )}

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onRegisterClick={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />
      
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onLoginClick={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </header>
  );
};

export default Header;
