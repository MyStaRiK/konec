import React from "react";
import "./Profile.css";

const Profile = ({ user, onClose }) => {
  if (!user) return null; // Если данных нет, ничего не отображаем

  return (
    <div className="profile-popup">
      <div className="profile-header">
        <h2>Ваш профиль</h2>
        <button onClick={onClose}>Закрыть</button>
      </div>
      <div className="profile-content">
        <p><strong>ФИО:</strong> {user.FIO || "Не указано"}</p>
        <p><strong>Дата рождения:</strong> {user.Bdata || "Не указана"}</p>
        <p><strong>Организация:</strong> {user.organization || "Не указана"}</p>
      </div>
    </div>
  );
};

export default Profile;
