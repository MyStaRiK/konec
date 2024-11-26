import React, { useState } from "react";
import "./Login.css";

const Login = ({ onBack, onLogin, onRegister }) => {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });
  const [notification, setNotification] = useState(null); // Уведомление
  const [isVisible, setIsVisible] = useState(true); // Видимость формы
  const [isBlurred, setIsBlurred] = useState(false); // Блюр-эффект

  const formatLogin = (value) => {
    const rawValue = value.replace(/\D/g, "");
    return rawValue
      .replace(/^(\d{1,1})/, "+7 (")
      .replace(/^(\+7\s\(\d{3})/, "$1) ")
      .replace(/(\d{3})(\d{2})/, "$1-$2-")
      .slice(0, 18);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "login" ? formatLogin(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsBlurred(true);
    setIsVisible(false); // Скрываем форму при отправке

    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Login: formData.login,
          Password: formData.password,
        }),
      });

      if (response.ok) {
        const userData = await fetch("http://localhost:3001/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Login: formData.login }),
        }).then((res) => res.json());

        onLogin(userData); // Передаем данные в App.js
        setNotification("Успешный вход!");
        setTimeout(() => {
          setNotification(null);
          setIsBlurred(false);
          onBack(); // Возвращаемся на главный экран
        }, 3000);
      } else if (response.status === 404) {
        setNotification("Пользователь с таким логином не найден. Зарегистрируйтесь.");
        setTimeout(() => {
          setNotification(null);
          setIsVisible(true); // Показываем форму снова
          setIsBlurred(false);
        }, 3000);
      } else if (response.status === 401) {
        setNotification("Неверный пароль. Проверьте данные.");
        setTimeout(() => {
          setNotification(null);
          setIsVisible(true); // Показываем форму снова
          setIsBlurred(false);
        }, 3000);
      } else {
        const result = await response.json();
        setNotification(`Ошибка: ${result.error}`);
        setTimeout(() => {
          setNotification(null);
          setIsVisible(true); // Показываем форму снова
          setIsBlurred(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Ошибка при входе:", error);
      setNotification("Произошла ошибка. Попробуйте снова позже.");
      setTimeout(() => {
        setNotification(null);
        setIsVisible(true); // Показываем форму снова
        setIsBlurred(false);
      }, 3000);
    }
  };

  return (
    <>
      {notification && <div className="success-message">{notification}</div>}
      <div className={`register-overlay ${isBlurred ? "blurred-background" : ""}`}>
        {isVisible && (
          <form className="input-modal" onSubmit={handleSubmit}>
            <h2>Вход</h2>
            <div className="form-group">
              <label>Логин</label>
              <input
                type="text"
                name="login"
                placeholder="+7 (999) 999-99-99"
                value={formData.login}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                name="password"
                placeholder="Введите ваш пароль"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="form-buttons">
              <button type="button" onClick={onBack}>
                Назад
              </button>
              <button type="submit">Войти</button>
            </div>
            <div className="form-links">
              <span onClick={onRegister} className="link">
                Регистрация
              </span>
              <span onClick={() => alert("Функция восстановления пароля в разработке.")} className="link">
                Забыли пароль?
              </span>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default Login;
