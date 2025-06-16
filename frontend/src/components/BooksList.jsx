import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StarRating from "./StarRating";
import FilterSidebar from "./FilterSidebar";
import { FiX } from "react-icons/fi";


const BooksList = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(12);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const isAdmin = user && user.id_role === 1;

  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("q") || "";

  const handleFilterChange = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      setPage(1);
    },
    []
  );

  const fetchBooks = async () => {
    try {
      let url = "http://87.228.102.111:8000/api/data/books/filter?";
      const urlParams = new URLSearchParams();

      if (searchQuery) {
        url = `http://87.228.102.111:8000/api/data/books/search?q=${encodeURIComponent(searchQuery)}`;
      } else {
        if (filters.genre_ids && filters.genre_ids.length > 0) {
          filters.genre_ids.forEach((id) => urlParams.append("genre_ids", id));
        }
        if (filters.min_price) {
          urlParams.append("min_price", filters.min_price);
        }
        if (filters.max_price) {
          urlParams.append("max_price", filters.max_price);
        }
        urlParams.append("page", page);
        urlParams.append("page_size", pageSize);
        url += urlParams.toString();
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Ошибка загрузки книг");
      const data = await res.json();

      if (searchQuery) {
        setBooks(data);
        setTotal(data.length);
      } else {
        setBooks(data.books);
        setTotal(data.total);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [filters, searchQuery, page, pageSize]);

  const handleDelete = async (bookId) => {
    if (!token) {
      alert("Требуется авторизация");
      return;
    }
    if (!window.confirm("Вы точно хотите удалить эту книгу?")) return;

    try {
      const res = await fetch(`http://87.228.102.111:8000/api/data/books/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Ошибка при удалении книги");
      // Обновляем список после удаления
      fetchBooks();
    } catch (e) {
      alert(e.message);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const goToPage = (num) => {
    if (num >= 1 && num <= totalPages) {
      setPage(num);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="flex max-w-7xl mx-auto p-4 gap-6 flex-col">
      <div className="flex">
        <FilterSidebar onFilterChange={handleFilterChange} />

        <div className="flex-1">
          {searchQuery && (
            <div className="mb-4 text-gray-700">
              Результаты поиска по: <strong>{searchQuery}</strong>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-center mt-4">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.length === 0 && !error && (
              <p className="text-center text-gray-600 col-span-full">Книги не найдены</p>
            )}
            {books.map((book) => {
              const photoUrl = book.photo
                ? book.photo.startsWith("http")
                  ? book.photo
                  : `http://87.228.102.111:8000${book.photo}`
                : null;

              const authorName = book.author_info
                ? book.author_info.name || book.author_info.username
                : "Неизвестный автор";

              return (
                <div
                  key={book.id}
                  className="relative cursor-pointer rounded overflow-hidden shadow-lg hover:shadow-2xl transition-shadow bg-white flex flex-col"
                >
                  {/* Кнопка удаления для админа */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center"
                      title="Удалить книгу"
                      aria-label="Удалить книгу"
                    >
                      <FiX size={20} />
                    </button>
                  )}


                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={book.title}
                      className="w-full h-48 object-cover"
                      onClick={() => navigate(`/books/${book.id}`)}
                    />
                  ) : (
                    <div
                      className="w-full h-48 bg-gray-300 flex items-center justify-center text-gray-600"
                      onClick={() => navigate(`/books/${book.id}`)}
                    >
                      Нет изображения
                    </div>
                  )}
                  <div
                    className="p-4 flex flex-col flex-grow cursor-pointer"
                    onClick={() => navigate(`/books/${book.id}`)}
                  >
                    <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                    <div className="text-sm text-gray-600 mb-2">Автор: {authorName}</div>
                    <p className="text-gray-700 text-sm flex-grow line-clamp-3">
                      {book.description}
                    </p>
                    <div className="mt-2">
                      <StarRating rating={book.average_rating || 0} disabled />
                      <div className="text-sm text-gray-600 mt-1">
                        Средний рейтинг: {(book.average_rating || 0).toFixed(1)}
                      </div>
                    </div>
                    <div className="mt-4 text-gray-900 font-bold">
                      {book.price.toLocaleString("ru-RU", {
                        style: "currency",
                        currency: "RUB",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <nav className="flex justify-center items-center mt-6 space-x-4 select-none">
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
          className={`px-3 py-1 rounded border ${
            page === 1 ? "text-gray-400 border-gray-300" : "hover:bg-gray-200 cursor-pointer"
          }`}
        >
          Предыдущая
        </button>

        <span className="font-semibold">
          Страница {page} из {totalPages}
        </span>

        <button
          onClick={() => goToPage(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          className={`px-3 py-1 rounded border ${
            page === totalPages || totalPages === 0
              ? "text-gray-400 border-gray-300"
              : "hover:bg-gray-200 cursor-pointer"
          }`}
        >
          Следующая
        </button>
      </nav>
    </div>
  );
};

export default BooksList;
