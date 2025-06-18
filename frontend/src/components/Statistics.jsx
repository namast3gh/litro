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

      // Проверяем роль
      if (parsedUser.id_role !== 1) {
        // Если не админ — редирект на главную или другую страницу
        navigate("/", { replace: true });
      }
    } else {
      // Если пользователь не залогинен — редирект на вход
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Пока проверяем — можно показать загрузку или пустой экран
  if (!user) {
    return <div>Загрузка...</div>;
  }

  // Если роль админа, показываем iframe с дашбордом
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <iframe
        src="https://cloud.umami.is/share/YcldVvEvgGiaZbiy/87.228.102.111:3000"
        title="Umami Public Dashboard"
        style={{ border: "none", width: "100%", height: "100%" }}
        allowFullScreen
      />
    </div>
  );
};

export default UmamiDashboard;
