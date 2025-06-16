import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  // Для модального окна редактирования
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editValues, setEditValues] = useState({
    username: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    name: "",
    biography: "",
  });
  const [editError, setEditError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  // Для переключения вкладок
  const [activeTab, setActiveTab] = useState("profile"); // profile или history

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.access_token) {
          setUser(parsedUser);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      setEditValues({
        username: user.username || "",
        email: user.email || "",
        oldPassword: "",
        newPassword: "",
        name: user.name || "",
        biography: user.biography || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user || activeTab !== "history") return;

    const fetchHistory = async () => {
      try {
        const response = await fetch(`${REACT_APP_API_BASE_URL}/profile/purchase-history`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        });
        if (!response.ok) throw new Error("Ошибка загрузки истории покупок");
        const data = await response.json();
        setPurchaseHistory(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchHistory();
  }, [user, activeTab]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <p className="text-lg text-gray-700">
          Пожалуйста, войдите в систему, чтобы просмотреть профиль.
        </p>
      </div>
    );
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(`${REACT_APP_API_BASE_URL}/users/upload-photo`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Неавторизованный запрос. Пожалуйста, войдите в систему.");
        }
        throw new Error("Ошибка загрузки фото");
      }

      const data = await response.json();

      const updatedUser = { ...user, photo: data.photo };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      setError(err.message || "Ошибка при загрузке");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm("Удалить аватарку?")) return;
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/users/delete-photo`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Неавторизованный запрос. Пожалуйста, войдите в систему.");
        }
        throw new Error("Ошибка при удалении аватарки");
      }

      await response.json();
      const updatedUser = { ...user, photo: "" };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      setError(err.message || "Ошибка при удалении");
    } finally {
      setDeleting(false);
    }
  };

  const photoUrl =
    user.photo && user.photo.length > 0
      ? user.photo.startsWith("http")
        ? user.photo
        : `http://87.228.102.111:8000${user.photo}`
      : null;

  const handleEditOpen = () => {
    setIsEditOpen(true);
    setEditSuccess(false);
    setEditError(null);
  };

  const handleEditClose = () => {
    setIsEditOpen(false);
    setEditError(null);
    setEditSuccess(false);
    setEditValues({
      username: user.username || "",
      email: user.email || "",
      oldPassword: "",
      newPassword: "",
      name: user.name || "",
      biography: user.biography || "",
    });
  };

  const handleEditChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(false);

    try {
      const payload = {
        username: editValues.username,
        email: editValues.email,
      };

      // Добавляем поля name и biography только если пользователь автор
      if (user.id_role === 4) {
        payload.name = editValues.name;
        payload.biography = editValues.biography;
      }

      if (editValues.oldPassword && editValues.newPassword) {
        payload.old_password = editValues.oldPassword;
        payload.new_password = editValues.newPassword;
      }

      const response = await fetch(
        `${REACT_APP_API_BASE_URL}/users/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.access_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Неавторизованный запрос. Пожалуйста, войдите в систему.");
        }
        const data = await response.json();
        throw new Error(data.detail || "Ошибка обновления профиля");
      }

      const data = await response.json();

      let updatedUser = { ...user, ...data };
      if (data.access_token) {
        updatedUser.access_token = data.access_token;
      }
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditSuccess(true);
      setTimeout(() => setIsEditOpen(false), 1200);
    } catch (err) {
      setEditError(err.message || "Ошибка при обновлении профиля");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex space-x-4 mb-6 border-b">
        <button
          className={`pb-2 font-semibold ${
            activeTab === "profile" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          Профиль
        </button>
        <button
          className={`pb-2 font-semibold ${
            activeTab === "history" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("history")}
        >
          История покупок
        </button>
      </div>

      {activeTab === "profile" && (
        <>
          <h1 className="text-2xl font-semibold mb-6 text-gray-900">
            Профиль пользователя
          </h1>

          <div className="flex flex-col items-center mb-6">
            {photoUrl ? (
              <div
                className="relative flex flex-col items-center group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ width: "96px", height: "96px" }}
              >
                <img
                  src={photoUrl}
                  alt="Аватар пользователя"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                />
                {isHovered && (
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    disabled={deleting}
                    className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition-colors"
                    style={{
                      transform: "translate(35%, -35%)",
                      border: "none",
                      cursor: deleting ? "not-allowed" : "pointer",
                      fontSize: "18px",
                      lineHeight: "1",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Удалить аватарку"
                  >
                    {deleting ? (
                      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <span style={{ fontWeight: "bold", fontSize: "20px", lineHeight: "1" }}>&times;</span>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600 border-2 border-gray-400">
                {user.username[0].toUpperCase()}
              </div>
            )}

            <label className="mt-4 cursor-pointer text-blue-600 hover:underline">
              {uploading ? "Загрузка..." : "Изменить фото"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {error && <p className="mt-2 text-red-600">{error}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Имя пользователя
              </label>
              <p className="mt-1 text-gray-900">{user.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Роль</label>
              <p className="mt-1 text-gray-900 capitalize">{user.role}</p>
            </div>

            {/* Показываем name и biography только для авторов */}
            {user.id_role === 4 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ФИО</label>
                  <p className="mt-1 text-gray-900">{user.name || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Описание</label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{user.biography || "-"}</p>
                </div>
              </>
            )}
          </div>

          <button
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={handleEditOpen}
          >
            Редактировать
          </button>

          {/* Модальное окно для редактирования */}
          {isEditOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative max-h-[90vh] overflow-y-auto">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                  onClick={handleEditClose}
                  title="Закрыть"
                >
                  &times;
                </button>
                <h2 className="text-xl font-semibold mb-4">Редактировать профиль</h2>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Имя пользователя</label>
                    <input
                      type="text"
                      name="username"
                      value={editValues.username}
                      onChange={handleEditChange}
                      className="mt-1 p-2 border rounded w-full"
                      required
                      minLength={3}
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editValues.email}
                      onChange={handleEditChange}
                      className="mt-1 p-2 border rounded w-full"
                      required
                    />
                  </div>
                  {user.id_role === 4 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">ФИО</label>
                        <input
                          type="text"
                          name="name"
                          value={editValues.name}
                          onChange={handleEditChange}
                          className="mt-1 p-2 border rounded w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Описание</label>
                        <textarea
                          name="biography"
                          value={editValues.biography}
                          onChange={handleEditChange}
                          className="mt-1 p-2 border rounded w-full"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Старый пароль</label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={editValues.oldPassword}
                      onChange={handleEditChange}
                      className="mt-1 p-2 border rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Новый пароль</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={editValues.newPassword}
                      onChange={handleEditChange}
                      className="mt-1 p-2 border rounded w-full"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className={`w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition ${
                      editLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {editLoading ? "Сохранение..." : "Сохранить"}
                  </button>
                  {editError && (
                    <p className="text-red-600 mt-2">{editError}</p>
                  )}
                  {editSuccess && (
                    <p className="text-green-600 mt-2">Профиль успешно обновлен!</p>
                  )}
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "history" && (
        <section>
          <h2 className="text-xl font-semibold mb-4">История покупок</h2>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          {purchaseHistory.length === 0 ? (
            <p className="text-gray-600">Покупок пока нет</p>
          ) : (
            <ul className="space-y-4">
              {purchaseHistory.map((item) => {
                const downloadUrl = user
                ? `${REACT_APP_API_BASE_URL}/data/books/download/${item.book.id}`
                : null;

                return (
                  <li key={item.id} className="flex items-center gap-4 border p-4 rounded shadow-sm">
                    <Link to={`/books/${item.book.id}`}>
                      <img
                        src={
                          item.book.photo
                            ? item.book.photo.startsWith("http")
                              ? item.book.photo
                              : `http://87.228.102.111:8000${item.book.photo}`
                            : "https://via.placeholder.com/80x120?text=Нет+изображения"
                        }
                        alt={item.book.title}
                        className="w-20 h-28 object-cover rounded cursor-pointer"
                      />
                    </Link>
                    <div className="flex flex-col flex-grow">
                      <h3 className="font-medium text-lg">{item.book.title}</h3>
                      <p className="text-sm text-gray-600">
                        Дата покупки: {new Date(item.purchase_date).toLocaleDateString("ru-RU")}
                      </p>
                      <p className="text-sm font-semibold">
                        Цена:{" "}
                        {item.book.price.toLocaleString("ru-RU", {
                          style: "currency",
                          currency: "RUB",
                        })}
                      </p>
                    </div>
                    {downloadUrl ? (
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        Скачать
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">Файл недоступен</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

    </div>
  );
};

export default Profile;
