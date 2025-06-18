import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UmamiDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      if (parsedUser.id_role !== 1) {
        navigate("/", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
<div
  style={{
    position: "fixed",
    top: "64px", // высота шапки
    left: 0,
    right: 0,
    bottom: 0,
    margin: 0,
    padding: 0,
    overflow: "hidden",
    zIndex: 10, // ниже шапки (50), но выше других элементов
  }}
>
  <iframe
    src="https://cloud.umami.is/share/YcldVvEvgGiaZbiy/87.228.102.111"
    title="Umami Public Dashboard"
    style={{ border: "none", width: "100%", height: "100%" }}
    allowFullScreen
  />
</div>

  );
};

export default UmamiDashboard;
