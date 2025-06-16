import React, { useEffect, useState, useRef } from "react";

const CommentsList = ({ bookId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const allowedRoles = ["admin", "user", "author"];
  const canComment = user && allowedRoles.includes(user.role?.toLowerCase());

  // Ссылка на DOM элемент комментария пользователя
  const userCommentRef = useRef(null);

  // Найдем комментарий пользователя
  const userComment = comments.find(c => c.id_user === user?.id);
  const isAdmin = user && (user.role?.toLowerCase() === "admin" || user.id_role === 1);

  useEffect(() => {
    fetch(`${REACT_APP_API_BASE_URL}/comments/book/${bookId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки комментариев");
        return res.json();
      })
      .then(setComments)
      .catch((err) => setError(err.message));
  }, [bookId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!newComment.trim()) {
      setError("Комментарий не может быть пустым");
      return;
    }

    if (!canComment || !token) {
      setError("Только авторизованные пользователи могут оставлять комментарии");
      return;
    }

    if (userComment) {
      setError("Вы уже оставили комментарий. Для изменения удалите старый.");
      return;
    }

    fetch(`${REACT_APP_API_BASE_URL}/comments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: newComment.trim(), id_book: bookId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка при отправке комментария");
        return res.json();
      })
      .then((comment) => {
        setComments([comment, ...comments]);
        setNewComment("");
        setMessage("Комментарий успешно добавлен");
      })
      .catch((err) => setError(err.message));
  };

  const handleDelete = (commentId) => {
    if (!token) {
      setError("Требуется авторизация для удаления комментария");
      return;
    }
    fetch(`${REACT_APP_API_BASE_URL}/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка при удалении комментария");
        setComments(comments.filter(c => c.id !== commentId));
        setMessage("Комментарий удалён");
      })
      .catch((err) => setError(err.message));
  };

  const scrollToUserComment = () => {
    if (userCommentRef.current) {
      userCommentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      // Можно добавить краткую анимацию подсветки
      userCommentRef.current.classList.add("ring", "ring-blue-400", "ring-offset-2");
      setTimeout(() => {
        userCommentRef.current.classList.remove("ring", "ring-blue-400", "ring-offset-2");
      }, 2000);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Комментарии</h2>

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {message && <div className="text-green-600 mb-2">{message}</div>}

      {canComment && !userComment && (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            className="w-full border border-gray-300 rounded p-2 mb-2"
            rows={3}
            placeholder="Оставьте комментарий..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Отправить
          </button>
        </form>
      )}

      {canComment && userComment && (
        <>
          <p className="text-gray-600 italic mb-4">
            Вы уже оставили комментарий. Для изменения удалите старый.
          </p>
          <button
            onClick={scrollToUserComment}
            className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Перейти к моему комментарию
          </button>
        </>
      )}

      {!canComment && (
        <p className="text-gray-600 italic mb-4">
          Только авторизованные пользователи могут оставлять комментарии.
        </p>
      )}

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {comments.length === 0 && <p>Комментариев пока нет.</p>}
        {comments.map((comment) => {
        const isUserComment = user && comment.id_user === user.id;
        return (
          <div
            key={comment.id}
            ref={isUserComment ? userCommentRef : null}
            className={`relative border border-gray-200 rounded p-3 group flex items-start gap-3 ${
              isUserComment ? "bg-yellow-50" : ""
            }`}
          >
            {(user && (isUserComment || isAdmin)) && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-600 transition"
                aria-label="Удалить комментарий"
              >
                &#10006;
              </button>
            )}
            <img
              src={comment.user_photo || "/default-avatar.png"}
              alt={comment.user_name || "Пользователь"}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-grow">
              <div className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                <strong>{comment.user_name || "Пользователь"}</strong>
                <span className="text-gray-500 text-xs">
                  {new Date(comment.date).toLocaleDateString("ru-RU")}{" "}
                  {new Date(comment.date).toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p>{comment.text}</p>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};

export default CommentsList;
