import React, { useEffect } from "react";

const UmamiScript = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.defer = true;
    script.src = "https://cloud.umami.is/script.js";
    script.setAttribute("data-website-id", "8bca10d0-fdf5-4e2e-a57a-fddcd844f1a0");
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

const Statistics = () => {
  return (
    <div className="max-w-5xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">Статистика сайта</h1>
      <UmamiScript />
      <div>
        {/* Umami автоматически собирает и отображает статистику — здесь можно добавить описание или инструкции */}
        <p className="text-center text-gray-600">
          Статистика собирается и отображается с помощью Umami Analytics.
        </p>
      </div>
    </div>
  );
};

export default Statistics;
