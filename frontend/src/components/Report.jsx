import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Report = () => {
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/report/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          const text = await res.text();
          console.log("Response text:", text); // Выведет ответ сервера
          if (!res.ok) throw new Error("Ошибка загрузки отчета");
          return JSON.parse(text); // Попытка распарсить JSON вручную
        })
        .then(setReport)
        .catch((err) => setError(err.message));
      
  }, []);

  if (error) {
    return <div className="text-red-600 text-center mt-4">{error}</div>;
  }

  if (!report) {
    return <div className="text-center mt-4">Загрузка...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Отчет по продажам книг
      </h2>
      <div className="mb-4 text-lg text-gray-700 font-semibold">
        Всего продано экземпляров: <span className="text-orange-600">{report.total_sold}</span>
      </div>
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border">Название книги</th>
            <th className="py-2 px-4 border">Продано экземпляров</th>
          </tr>
        </thead>
        <tbody>
          {report.books.map((book) => (
            <tr key={book.id}>
              <td className="py-2 px-4 border">{book.title}</td>
              <td className="py-2 px-4 border text-center">{book.sold_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Report;
