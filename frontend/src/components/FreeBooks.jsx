import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";

const FreeBooks = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFreeBooks = async () => {
      try {
        const res = await fetch("http://87.228.102.111:8000/api/data/books/free");
        if (!res.ok) throw new Error("Ошибка загрузки бесплатных книг");
        const data = await res.json();
        setBooks(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchFreeBooks();
  }, []);

  if (error) return <div className="text-red-600 text-center mt-4">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Бесплатные книги</h2>
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
              className="cursor-pointer rounded overflow-hidden shadow-lg hover:shadow-2xl transition-shadow bg-white flex flex-col"
              onClick={() => navigate(`/books/${book.id}`)}
            >
              {photoUrl ? (
                <img src={photoUrl} alt={book.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-300 flex items-center justify-center text-gray-600">
                  Нет изображения
                </div>
              )}
              <div className="p-4 flex flex-col flex-grow">
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
                  {book.price.toLocaleString("ru-RU", { style: "currency", currency: "RUB" })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FreeBooks;
