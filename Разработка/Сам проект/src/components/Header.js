import React, { useState } from "react";
import Register from "./Register";
import Login from "./Login";
import Profile from "./Profile";
import "./Header.css";

const Header = ({ isAuthenticated, user, onLogout, onLogin, onNavigate }) => {
  const [currentForm, setCurrentForm] = useState(null); // null, "login", "register"
  const [showProfile, setShowProfile] = useState(false); // Отображение профиля

  const handleLoginClick = () => setCurrentForm("login");
  const handleRegisterClick = () => setCurrentForm("register");
  const handleBackClick = () => setCurrentForm(null); // Закрытие форм
  const toggleProfile = () => setShowProfile(!showProfile); // Переключение профиля

  const handleUnderDevelopment = () => {
    alert("Функция находится в разработке. Следите за обновлениями!");
  };

  return (
    <header className="header">
      <nav>
        <a href="#" onClick={() => onNavigate("main")}>
          Домой
        </a>
        <a href="#" onClick={() => onNavigate("competitions")}>
          Соревнования
        </a>
        <a href="#" onClick={handleUnderDevelopment}>
          Участники
        </a>
        <a href="#" onClick={handleUnderDevelopment}>
          Новости
        </a>
        <a href="#" onClick={handleUnderDevelopment}>
          Контакты
        </a>
      </nav>
      <div className="auth">
        {!isAuthenticated ? (
          <>
            <button onClick={handleLoginClick}>Вход</button>
            <button onClick={handleRegisterClick}>Регистрация</button>
          </>
        ) : (
          <>
            <button onClick={toggleProfile}>Профиль</button>
            <button onClick={onLogout}>Выход</button>
          </>
        )}
      </div>
      {currentForm === "register" && (
        <Register
          onBack={handleBackClick}
        />
      )}
      {currentForm === "login" && (
        <Login
          onBack={handleBackClick}
          onLogin={onLogin}
          onRegister={() => setCurrentForm("register")} // Ссылка на регистрацию из формы входа
        />
      )}
      {showProfile && <Profile user={user} onClose={toggleProfile} />}
    </header>
  );
};

export default Header;
