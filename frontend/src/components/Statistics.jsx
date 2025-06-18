import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://87.228.102.111:8000/api"; // прописываем прямо URL backend

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/umami/stats`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Ошибка API: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Umami stats data:", data);
        setStats(data);
      })
      .catch((err) => {
        console.error("Ошибка при загрузке статистики:", err);
        setError(err.message);
      });
  }, []);

  if (error) {
    return <div className="text-red-600 text-center mt-4">Ошибка: {error}</div>;
  }

  if (!stats) {
    return <div className="text-center mt-4">Загрузка статистики...</div>;
  }

  const visitors = stats.visitors ?? stats.data?.visitors ?? "—";
  const pageviews = stats.pageviews ?? stats.data?.pageviews ?? "—";
  const bounceRate = stats.bounce_rate ?? stats.data?.bounce_rate ?? "—";

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">Статистика Umami</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <div className="text-4xl font-bold">{visitors}</div>
          <div className="text-gray-600">Посетителей</div>
        </div>
        <div>
          <div className="text-4xl font-bold">{pageviews}</div>
          <div className="text-gray-600">Просмотров страниц</div>
        </div>
        <div>
          <div className="text-4xl font-bold">{bounceRate}%</div>
          <div className="text-gray-600">Показатель отказов</div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
