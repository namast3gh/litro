import React, { useEffect, useState } from "react";

const UMAMI_API_TOKEN = "api_xdGUZXsFcfS5SVvnBw5zOnOlUl30TiEs";
const WEBSITE_ID = "8bca10d0-fdf5-4e2e-a57a-fddcd844f1a0"; // ваш website id
const UMAMI_API_URL = `https://cloud.umami.is/api/websites/${WEBSITE_ID}/stats/overview`;

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(UMAMI_API_URL, {
      headers: {
        Authorization: `Bearer ${UMAMI_API_TOKEN}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Ошибка API: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setStats(data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="text-red-600 text-center mt-4">Ошибка: {error}</div>;
  }

  if (!stats) {
    return <div className="text-center mt-4">Загрузка статистики...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">Статистика Umami</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <div className="text-4xl font-bold">{stats.visitors}</div>
          <div className="text-gray-600">Посетителей</div>
        </div>
        <div>
          <div className="text-4xl font-bold">{stats.pageviews}</div>
          <div className="text-gray-600">Просмотров страниц</div>
        </div>
        <div>
          <div className="text-4xl font-bold">{stats.bounce_rate}%</div>
          <div className="text-gray-600">Показатель отказов</div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
