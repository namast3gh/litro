import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const UploadBookAdmin = () => {
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [selectedGenreId, setSelectedGenreId] = useState("");
  const [selectedAuthorId, setSelectedAuthorId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [pages, setPages] = useState("");
  const [price, setPrice] = useState("");
  const [photo, setPhoto] = useState(null);
  const [content, setContent] = useState(null);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Разрешённая роль — админ (например, id_role === 1)
  const allowedRoles = [1];

  useEffect(() => {
    // Загрузка жанров
    fetch("http://localhost:8000/api/data/genres")
      .then((res) => res.json())
      .then(setGenres)
      .catch(() => setMessage("Ошибка загрузки списка жанров"));

    // Загрузка классических авторов
    fetch("http://localhost:8000/api/data/authors")
      .then((res) => res.json())
      .then(setAuthors)
      .catch(() => setMessage("Ошибка загрузки списка авторов"));
  }, []);

  if (!user || !token || !allowedRoles.includes(user.id_role)) {
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
      !selectedGenreId ||
      !selectedAuthorId
    ) {
      setMessage("Пожалуйста, заполните все обязательные поля, выберите жанр и автора.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("publication_date", publicationDate);
    formData.append("pages", parseInt(pages, 10));
    formData.append("price", parseFloat(price));
    formData.append("id_genres", selectedGenreId); // жанр
    formData.append("id_author", selectedAuthorId); // классический автор
    if (photo) formData.append("photo", photo);
    formData.append("content", content);

    try {
      const res = await fetch("http://localhost:8000/api/data/upload-book-admin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setMessage("Книга успешно загружена!");
        // Очистка формы
        setTitle("");
        setDescription("");
        setPublicationDate("");
        setPages("");
        setPrice("");
        setPhoto(null);
        setContent(null);
        setSelectedGenreId("");
        setSelectedAuthorId("");
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
      <h2 className="text-xl font-bold mb-4">Загрузить книгу (админ)</h2>
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

        <select
          value={selectedAuthorId}
          onChange={(e) => setSelectedAuthorId(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="" disabled>
            Выберите классического автора
          </option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
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

export default UploadBookAdmin;
