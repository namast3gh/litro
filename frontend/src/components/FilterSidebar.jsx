import React, { useEffect, useState } from "react";

const FilterSidebar = ({ onFilterChange }) => {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showMoreGenres, setShowMoreGenres] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/data/genres")
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

  return (
    <aside className="w-64 p-4 bg-white border-r">
      <h2 className="font-bold mb-2">Жанры</h2>
      <div className="mb-4">
        {/* Отображаем первые 5 жанров */}
        {visibleGenres.map(genre => (
          <label key={genre.id} className="block">
            <input
              type="checkbox"
              checked={selectedGenres.includes(genre.id)}
              onChange={() => handleGenreChange(genre.id)}
              className="mr-2"
            />
            {genre.title}
          </label>
        ))}

        {/* Кнопка показать/скрыть остальные жанры */}
        {hiddenGenres.length > 0 && (
          <>
            {!showMoreGenres && (
              <button
                type="button"
                className="text-blue-600 hover:underline mt-2"
                onClick={() => setShowMoreGenres(true)}
              >
                Показать ещё...
              </button>
            )}

            {showMoreGenres && (
              <div className="mt-2 border p-2 max-h-48 overflow-y-auto rounded bg-gray-50">
                {hiddenGenres.map(genre => (
                  <label key={genre.id} className="block">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre.id)}
                      onChange={() => handleGenreChange(genre.id)}
                      className="mr-2"
                    />
                    {genre.title}
                  </label>
                ))}
                <button
                  type="button"
                  className="text-blue-600 hover:underline mt-2"
                  onClick={() => setShowMoreGenres(false)}
                >
                  Скрыть
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <h2 className="font-bold mb-2">Цена</h2>
      <div className="mb-4 flex gap-2">
        <input
          type="number"
          placeholder="от"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
          className="w-20 border rounded px-2 py-1"
        />
        <input
          type="number"
          placeholder="до"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          className="w-20 border rounded px-2 py-1"
        />
      </div>
    </aside>
  );
};

export default FilterSidebar;
