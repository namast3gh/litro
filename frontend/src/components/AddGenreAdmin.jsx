import React, { useState } from "react";
import { Navigate } from "react-router-dom";

const AddGenreAdmin = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Разрешённая роль — админ (id_role === 1)
  const allowedRoles = [1];

  if (!user || !token || !allowedRoles.includes(user.id_role)) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!title.trim()) {
      setMessage("Пожалуйста, введите название жанра.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/data/genres`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (res.ok) {
        setMessage("Жанр успешно добавлен!");
        setTitle("");
      } else {
        const data = await res.json();
        setMessage(data.detail || "Ошибка при добавлении жанра");
      }
    } catch (error) {
      setMessage("Ошибка сети или сервера");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Добавить жанр (админ)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Название жанра"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Добавить жанр
        </button>
        {message && <div className="text-center mt-2">{message}</div>}
      </form>
    </div>
  );
};

export default AddGenreAdmin;
