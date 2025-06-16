import React, { useState, useEffect } from "react";

const StarRating = ({ rating, onRate, disabled }) => {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(rating);

  useEffect(() => {
    setSelected(rating);
  }, [rating]);

  const stars = [1, 2, 3, 4, 5];

  // Функция для определения типа заливки звезды (полностью, половина, пустая)
  const getFill = (star) => {
    if (hover >= star) return "#ffc107";
    if (!hover && selected >= star) return "#ffc107";
    if (!hover && selected + 0.5 >= star) return "url(#half)"; // половина звезды
    return "#e4e5e9";
  };

  return (
    <>
      <svg width="0" height="0">
        <defs>
          <linearGradient id="half">
            <stop offset="50%" stopColor="#ffc107" />
            <stop offset="50%" stopColor="#e4e5e9" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ display: "flex", cursor: disabled ? "default" : "pointer" }}>
        {stars.map((star) => (
          <svg
            key={star}
            onClick={() => {
              if (!disabled && onRate) onRate(star);
              setSelected(star);
            }}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => !disabled && setHover(0)}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={getFill(star)}
            stroke="#ffc107"
            strokeWidth="1"
            style={{ marginRight: 4 }}
          >
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
          </svg>
        ))}
      </div>
    </>
  );
};

export default StarRating;
