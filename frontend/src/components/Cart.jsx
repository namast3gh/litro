// Cart.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Cart = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [successMessage, setSuccessMessage] = useState(null); // Новое состояние для сообщения
  const token = localStorage.getItem("token");
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


  const fetchCart = () => {
    fetch(`${API_BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки корзины");
        return res.json();
      })
      .then(setBooks)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeFromCart = (bookId) => {
    fetch(`${API_BASE_URL}/cart/remove/${bookId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка удаления");
        fetchCart();
        setSelectedBooks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(bookId);
          return newSet;
        });
      })
      .catch((err) => setError(err.message));
  };

  const removeSelected = () => {
    selectedBooks.forEach((bookId) => {
      removeFromCart(bookId);
    });
    setSelectedBooks(new Set());
  };

  const toggleSelect = (bookId) => {
    setSelectedBooks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };

  const handleCheckout = async () => {
    if (selectedBooks.size === 0) {
      alert("Выберите хотя бы одну книгу для покупки");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/cart/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ book_ids: Array.from(selectedBooks) }),
      });
      if (!response.ok) throw new Error("Ошибка оформления покупки");
      // Показываем сообщение о том, где скачать книги
      setSuccessMessage(
        "Покупка успешно оформлена! Скачать купленные книги можно в Истории покупок (Профиль -> История покупок)."
      );
      fetchCart(); // обновляем корзину после покупки
      setSelectedBooks(new Set());
    } catch (err) {
      setError(err.message);
    }
  };

  if (error)
    return (
      <div className="text-red-600 p-4 text-center font-semibold">{error}</div>
    );

  if (books.length === 0)
    return (
      <div className="p-6 text-center text-gray-600 font-medium text-lg">
        Ваша корзина пуста
      </div>
    );

  const hasSelected = selectedBooks.size > 0;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Ваша корзина
      </h2>

      {/* Сообщение об успешной покупке */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-4 text-green-700 font-bold hover:text-green-900"
            aria-label="Закрыть сообщение"
          >
            ×
          </button>
        </div>
      )}

      <ul className="space-y-6">
        {books.map((book) => {
          const photoUrl = book.photo
            ? book.photo.startsWith("http")
              ? book.photo
              : `http://87.228.102.111:8000${book.photo}`
            : "https://via.placeholder.com/100x140?text=Нет+изображения";
          const isSelected = selectedBooks.has(book.id);

          return (
            <li
              key={book.id}
              className={`flex items-center space-x-6 border-b pb-4 last:border-b-0 ${
                isSelected ? "bg-gray-50" : ""
              }`}
            >
              <input
                type="checkbox"
                id={`book-${book.id}`}
                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                checked={isSelected}
                onChange={() => toggleSelect(book.id)}
              />
              <Link to={`/books/${book.id}`} className="block">
                <img
                  src={photoUrl}
                  alt={book.title}
                  className="w-24 h-36 object-cover rounded-md shadow-sm hover:opacity-90 transition-opacity"
                />
              </Link>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{book.title}</h3>
                <p className="text-gray-600 mt-1 line-clamp-2">{book.description}</p>
                <div className="mt-2 text-lg font-bold text-gray-800">
                  {book.price.toLocaleString("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                  })}
                </div>
              </div>
              <button
                onClick={() => removeFromCart(book.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                aria-label={`Удалить ${book.title} из корзины`}
              >
                Удалить
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-between items-center mt-8">
        {hasSelected && (
          <button
            onClick={removeSelected}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            Удалить выбранное
          </button>
        )}
        <button
          onClick={handleCheckout}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Купить
        </button>
      </div>
    </div>
  );
};

export default Cart;
