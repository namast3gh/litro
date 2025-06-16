import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import StarRating from "./StarRating";
import CommentsList from "./CommentsList";

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(true);
  const [inCart, setInCart] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const ratingLoaded = useRef(false);

  useEffect(() => {
    fetch(`${REACT_APP_API_BASE_URL}/data/books/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки книги");
        return res.json();
      })
      .then(setBook)
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    if (ratingLoaded.current) return;
    if (user && token) {
      fetch(`${REACT_APP_API_BASE_URL}/data/ratings/user/${user.id}/book/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Ошибка загрузки рейтинга");
          return res.json();
        })
        .then((data) => {
          if (data.rating && data.rating > 0) {
            setUserRating(data.rating);
            setEditMode(false);
          } else {
            setUserRating(0);
            setEditMode(true);
          }
          ratingLoaded.current = true;
        })
        .catch(() => {
          setUserRating(0);
          setEditMode(true);
          ratingLoaded.current = true;
        });
    } else {
      setUserRating(0);
      setEditMode(true);
      ratingLoaded.current = true;
    }
  }, [user, token, id]);

  useEffect(() => {
    if (!user || !token) {
      setInCart(false);
      return;
    }
    fetch(`${REACT_APP_API_BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(cartBooks => {
        setInCart(cartBooks.some(b => b.id === parseInt(id)));
      })
      .catch(() => setInCart(false));
  }, [id, user, token]);

  const handleAddToCart = () => {
    if (!user) {
      setMessage("Пожалуйста, войдите, чтобы добавить в корзину");
      return;
    }
    fetch(`${REACT_APP_API_BASE_URL}/cart/add/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Ошибка добавления в корзину");
        setInCart(true);
        setMessage("Книга добавлена в корзину");
      })
      .catch(() => setMessage("Ошибка при добавлении в корзину"));
  };

  const handleRate = (value) => {
    if (!user || user.id_role === 3) {
      setMessage("Только зарегистрированные пользователи могут ставить рейтинг");
      return;
    }

    fetch(`${REACT_APP_API_BASE_URL}/data/books/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating: value, id_book: parseInt(id) }),
    })
      .then((res) => {
        if (res.ok) {
          setUserRating(value);
          setMessage("Рейтинг сохранён");
          setEditMode(false);
          return fetch(`${REACT_APP_API_BASE_URL}/data/books/${id}`);
        } else {
          throw new Error("Ошибка при сохранении рейтинга");
        }
      })
      .then((res) => res.json())
      .then(setBook)
      .catch(() => setMessage("Ошибка при сохранении рейтинга"));
  };

  if (error) {
    return <div className="text-red-600 text-center mt-4">{error}</div>;
  }

  if (!book) {
    return <div className="text-center mt-4">Загрузка...</div>;
  }

  const photoUrl = book.photo
    ? book.photo.startsWith("http")
      ? book.photo
      : `${REACT_APP_API_BASE_URL}${book.photo}`
    : null;

  const authorName = book.author_info
    ? book.author_info.name || book.author_info.username
    : "Неизвестный автор";

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-10">
      <div className="flex flex-col md:flex-row gap-6">
        {photoUrl && (
          <img
            src={photoUrl}
            alt={book.title}
            className="w-full h-full object-cover rounded"
          />
        )}
        <div className="flex flex-col flex-grow">
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <div className="mb-4 text-gray-700 text-lg">Автор: {authorName}</div>
          <p className="mb-4 whitespace-pre-wrap">{book.description}</p>
          <p className="mb-2">
            <strong>Дата публикации:</strong>{" "}
            {new Date(book.publication_date).toLocaleDateString("ru-RU")}
          </p>
          <p className="mb-2">
            <strong>Количество страниц:</strong> {book.pages}
          </p>
          <p className="mb-4 text-xl font-semibold text-gray-900">
            {book.price.toLocaleString("ru-RU", {
              style: "currency",
              currency: "RUB",
            })}
          </p>

          <div>
            <div className="mb-1 font-semibold">
              Средний рейтинг: {book.average_rating?.toFixed(1) || "0.0"}
            </div>

            <StarRating
              rating={userRating}
              onRate={editMode ? handleRate : undefined}
              disabled={!editMode}
            />

            {message && <p className="mt-2 text-green-600">{message}</p>}

            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Изменить оценку
              </button>
            )}
          </div>

          <div className="mt-4">
            {inCart ? (
              <div className="text-green-700 font-semibold mb-4">Уже в корзине</div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
              >
                Добавить в корзину
              </button>
            )}
          </div>

          {/* Комментарии */}
          <CommentsList bookId={parseInt(id)} />
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
