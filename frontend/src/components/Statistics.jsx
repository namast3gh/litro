import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const API_BASE_URL = "http://87.228.102.111:8000/api";

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

  // Обработка visits: если это объект, преобразуем в массив для графика
  const visitsData = Array.isArray(stats.visits)
    ? stats.visits.map(item => ({
        date: item.date,
        visits: item.value,
      }))
    : stats.visits && typeof stats.visits === 'object'
    ? Object.entries(stats.visits).map(([date, data]) => ({
        date,
        visits: data.value,
      }))
    : [];

  const visitors = stats.visitors?.value ?? "—";
  const pageviews = stats.pageviews?.value ?? "—";
  const bounceRate = stats.bounce_rate?.value ?? "—";

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">Подробная статистика Umami</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-10">
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

      <h2 className="text-2xl font-semibold mb-4">Динамика посещений за последние дни</h2>
      {visitsData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={visitsData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="visits"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-500">Данные о посещениях отсутствуют</p>
      )}
    </div>
  );
};

export default Statistics;
