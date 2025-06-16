import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const UploadBook = () => {
  const [genres, setGenres] = useState([]);
  const [selectedGenreId, setSelectedGenreId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [pages, setPages] = useState("");
  const [price, setPrice] = useState("");
  const [photo, setPhoto] = useState(null);
  const [content, setContent] = useState(null);
  const [message, setMessage] = useState("");

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.access_token || null;

  const allowedRoles = [4]

  useEffect(() => {
    fetch(`${API_BASE_URL}/data/genres`)
      .then((res) => res.json())
      .then((data) => setGenres(data))
      .catch(() => setMessage("Ошибка загрузки списка жанров"));
  }, []);

  if (
    !user ||
    !token ||
    !user.id_role ||
    !allowedRoles.includes(user.id_role)
  ) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !title.trim() ||
      !description.trim() ||
      !publicationDate ||
      !pages ||
      !price ||
      !content ||
      !selectedGenreId
    ) {
      setMessage("Пожалуйста, заполните все обязательные поля, выберите жанр и файл книги.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("publication_date", publicationDate);
    formData.append("pages", parseInt(pages, 10));
    formData.append("price", parseFloat(price));
    formData.append("id_genres", selectedGenreId); // отправляем выбранный жанр
    if (photo) formData.append("photo", photo);
    formData.append("content", content);

    try {
      const res = await fetch(`${API_BASE_URL}/data/upload-book`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setMessage("Книга успешно загружена!");
        setTitle("");
        setDescription("");
        setPublicationDate("");
        setPages("");
        setPrice("");
        setPhoto(null);
        setContent(null);
        setSelectedGenreId("");
      } else {
        const data = await res.json();
        setMessage(data.detail || "Ошибка загрузки книги");
      }
    } catch (error) {
      setMessage("Ошибка сети или сервера");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Загрузить книгу</h2>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <select
          value={selectedGenreId}
          onChange={(e) => setSelectedGenreId(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="" disabled>
            Выберите жанр
          </option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.title}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Название книги"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
          rows={4}
          required
        />
        <input
          type="date"
          value={publicationDate}
          onChange={(e) => setPublicationDate(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="number"
          min="1"
          placeholder="Количество страниц"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Цена"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <label className="block">
          Фото книги (обложка)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
            className="w-full"
          />
        </label>
        <label className="block">
          Файл книги (PDF, EPUB и т.п.)
          <input
            type="file"
            accept=".pdf,.epub,.mobi,.azw3"
            onChange={(e) => setContent(e.target.files[0])}
            className="w-full"
            required
          />
        </label>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Загрузить
        </button>
        {message && <div className="text-center mt-2">{message}</div>}
      </form>
    </div>
  );
};

export default UploadBook;
