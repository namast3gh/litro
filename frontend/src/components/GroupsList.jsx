import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";


const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const isAdmin = user && user.id_role === 1;

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("http://87.228.102.111:8000/api/data/groups");
        if (!res.ok) throw new Error("Ошибка загрузки групп");
        const data = await res.json();
        setGroups(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchGroups();
  }, []);

  const handleDeleteBook = async (bookId, groupId) => {
    if (!token) {
      alert("Требуется авторизация");
      return;
    }
    if (!window.confirm("Вы точно хотите удалить эту книгу?")) return;

    try {
      const res = await fetch(`http://87.228.102.111:8000/api/data/books/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Ошибка при удалении книги");

      // Обновляем список групп после удаления
      const resGroups = await fetch("http://87.228.102.111:8000/api/data/groups");
      if (!resGroups.ok) throw new Error("Ошибка загрузки групп");
      const dataGroups = await resGroups.json();
      setGroups(dataGroups);
    } catch (e) {
      alert(e.message);
    }
  };

  if (error) return <div className="text-red-600 text-center mt-4">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Книги недели</h2>
      {groups.length === 0 && <p>Группы не найдены</p>}
      {groups.map((group) => (
        <div key={group.id} className="mb-8">
          <h3 className="text-xl font-semibold mb-2">{group.title}</h3>
          {group.description && <p className="mb-2">{group.description}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {group.books.map((book) => (
              <div
                key={book.id}
                className="relative cursor-pointer rounded overflow-hidden shadow-lg hover:shadow-2xl transition-shadow bg-white flex flex-col"
              >
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBook(book.id, group.id);
                  }}
                  className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center"
                  title="Удалить книгу"
                  aria-label="Удалить книгу"
                >
                  <FiX size={20} />
                </button>
              )}

                {book.photo ? (
                  <img
                    src={book.photo.startsWith("http") ? book.photo : `http://87.228.102.111:8000${book.photo}`}
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
                  <h4 className="font-semibold text-lg mb-2">{book.title}</h4>
                  <p className="text-gray-700 text-sm flex-grow line-clamp-3">{book.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupList;
