import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";

const TopBooks = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const isAdmin = user && user.id_role === 1;

  useEffect(() => {
    const fetchTopBooks = async () => {
      try {
        const res = await fetch(`${REACT_APP_API_BASE_URL}/data/books/top`);
        if (!res.ok) throw new Error("Ошибка загрузки топ книг");
        const data = await res.json();
        setBooks(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchTopBooks();
  }, []);

  const handleDelete = async (bookId) => {
    if (!token) {
      alert("Требуется авторизация");
      return;
    }
    if (!window.confirm("Вы точно хотите удалить эту книгу?")) return;

    try {
      const res = await fetch(`${REACT_APP_API_BASE_URL}/data/books/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Ошибка при удалении книги");
      // Обновляем список после удаления
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    } catch (e) {
      alert(e.message);
    }
  };

  if (error) {
    return <div className="text-red-600 text-center mt-4">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Топ книг</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.length === 0 && (
          <p className="text-center text-gray-600 col-span-full">Книги не найдены</p>
        )}
        {books.map((book) => {
          const photoUrl =
            book.photo && (book.photo.startsWith("http") ? book.photo : `http://87.228.102.111:8000${book.photo}`);

          const authorName = book.author_info
            ? book.author_info.name || book.author_info.username
            : "Неизвестный автор";

          return (
            <div
              key={book.id}
              className="relative cursor-pointer rounded overflow-hidden shadow-lg hover:shadow-2xl transition-shadow bg-white flex flex-col"
            >
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(book.id);
                  }}
                  className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center"
                  title="Удалить книгу"
                  aria-label="Удалить книгу"
                >
                  &#10006;
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
                <p className="text-gray-700 text-sm flex-grow line-clamp-3">{book.description}</p>
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
  );
};

export default TopBooks;
