import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom"; // Добавлено использование маршрутов
import Header from "./components/Header";
import Main from "./components/Main";
import Register from "./components/Register";
import Competitions from "./components/Competitions"; // Новый компонент для соревнований
import Footer from "./components/Footer";
import Analyze from "./components/Analyze"; // Импорт нового компонента

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Используем для навигации между страницами

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleNavigateToRegister = () => {
    navigate("/register"); // Навигация к странице регистрации
  };

  const handleNavigateToCompetitions = () => {
    navigate("/competitions"); // Навигация к странице соревнований
  };

  const handleBackToMain = () => {
    navigate("/"); // Возврат на главную страницу
  };

  const handleUnderDevelopment = () => {
    alert("Функция находится в разработке. Следите за обновлениями!");
  };

  return (
    <div className="App">
      <Header
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
        onLogin={handleLogin}
        onNavigate={(view) => {
          if (view === "competitions") {
            handleNavigateToCompetitions();
          } else if (view === "register") {
            handleNavigateToRegister();
          } else if (view === "main") {
            handleBackToMain();
          } else {
            handleUnderDevelopment();
          }
        }}
      />
      <Routes>
        <Route
          path="/"
          element={<Main onNavigateToRegister={handleNavigateToRegister} />}
        />
        <Route path="/register" element={<Register onBack={handleBackToMain} />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/analyze" element={<Analyze />} /> 
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
