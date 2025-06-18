import React, { useEffect, useState } from "react";
import { X, Filter } from "lucide-react";

const FilterSidebar = ({ onFilterChange }) => {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showMoreGenres, setShowMoreGenres] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("http://87.228.102.111:8000/api/data/genres")
      .then(res => res.json())
      .then(data => setGenres(data));
  }, []);

  const handleGenreChange = (id) => {
    setSelectedGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    onFilterChange({
      genre_ids: selectedGenres,
      min_price: minPrice,
      max_price: maxPrice,
    });
  }, [selectedGenres, minPrice, maxPrice, onFilterChange]);

  const visibleGenres = genres.slice(0, 5);
  const hiddenGenres = genres.slice(5);

  const FilterContent = () => (
    <>
      <h2 className="font-bold mb-4 text-lg">Жанры</h2>
      <div className="mb-6">
        {/* Отображаем первые 5 жанров */}
        <div className="space-y-3">
          {visibleGenres.map(genre => (
            <label key={genre.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={selectedGenres.includes(genre.id)}
                onChange={() => handleGenreChange(genre.id)}
                className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700">{genre.title}</span>
            </label>
          ))}
        </div>

        {/* Кнопка показать/скрыть остальные жанры */}
        {hiddenGenres.length > 0 && (
          <>
            {!showMoreGenres && (
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 mt-3 text-sm font-medium transition-colors"
                onClick={() => setShowMoreGenres(true)}
              >
                Показать ещё ({hiddenGenres.length})...
              </button>
            )}

            {showMoreGenres && (
              <div className="mt-3 border border-gray-200 p-3 max-h-48 overflow-y-auto rounded-lg bg-gray-50">
                <div className="space-y-2">
                  {hiddenGenres.map(genre => (
                    <label key={genre.id} className="flex items-center cursor-pointer hover:bg-white p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedGenres.includes(genre.id)}
                        onChange={() => handleGenreChange(genre.id)}
                        className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{genre.title}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 mt-3 text-sm font-medium transition-colors"
                  onClick={() => setShowMoreGenres(false)}
                >
                  Скрыть
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <h2 className="font-bold mb-4 text-lg">Цена</h2>
      <div className="mb-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">От</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">До</label>
            <input
              type="number"
              placeholder="1000"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Кнопка фильтров для мобильных */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-40 hover:bg-blue-700 transition-colors"
        aria-label="Открыть фильтры"
      >
        <Filter className="w-6 h-6" />
      </button>

      {/* Мобильная версия - модальное окно */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Фон */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Модальное окно */}
          <div className="relative bg-white w-full max-w-sm mx-auto my-4 rounded-lg shadow-xl flex flex-col max-h-[calc(100vh-2rem)]">
            {/* Заголовок - фиксированный */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Содержимое фильтров - прокручиваемое */}
            <div className="flex-1 overflow-y-auto p-4">
              <FilterContent />
            </div>

            {/* Кнопки действий - фиксированные */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Применить фильтры
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Десктопная версия - боковая панель */}
      <aside className="hidden md:block w-64 p-6 bg-white border-r border-gray-200 h-full overflow-y-auto">
        <FilterContent />
      </aside>
    </>
  );
};

export default FilterSidebar;