import React from "react";

const Statistics = () => {
  return (
    <div className="max-w-5xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">Статистика Umami (Публичная)</h1>
      <div className="w-full h-[700px]">
        <iframe
          src="https://cloud.umami.is/share/YcldVvEvgGiaZbiy/87.228.102.111"
          title="Umami Public Stats"
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default Statistics;
