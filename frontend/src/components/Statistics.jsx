import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const API_BASE_URL = "http://87.228.102.111:8000/api";

const StatisticsDetailed = () => {
  const [dailyStats, setDailyStats] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/umami/stats/daily`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Ошибка API: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Преобразуем данные в формат для Recharts
        // Предполагается, что data — массив объектов с датой и метриками
        const formattedData = data.map(item => ({
          date: new Date(item.date).toLocaleDateString(),
          visitors: item.visitors?.value ?? 0,
          pageviews: item.pageviews?.value ?? 0,
          bounceRate: item.bounce_rate?.value ?? 0,
        }));
        setDailyStats(formattedData);
      })
      .catch((err) => {
        setError(err.message);
        console.error(err);
      });
  }, []);

  if (error) {
    return <div className="text-red-600 text-center mt-4">Ошибка: {error}</div>;
  }

  if (!dailyStats.length) {
    return <div className="text-center mt-4">Загрузка статистики...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">Подробная статистика Umami (последние 30 дней)</h1>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={dailyStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" label={{ value: 'Число', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} label={{ value: 'Показатель отказов %', angle: 90, position: 'insideRight' }} />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Line yAxisId="left" type="monotone" dataKey="visitors" stroke="#8884d8" name="Посетители" />
          <Line yAxisId="left" type="monotone" dataKey="pageviews" stroke="#82ca9d" name="Просмотры" />
          <Line yAxisId="right" type="monotone" dataKey="bounceRate" stroke="#ff7300" name="Показатель отказов" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatisticsDetailed;
