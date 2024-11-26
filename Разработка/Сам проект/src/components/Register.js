import React, { useState, useEffect } from "react";
import "./Register.css";

const Register = ({ onBack }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    organization: "",
    birthDate: "",
    role: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null); // Уведомление
  const [isVisible, setIsVisible] = useState(true); // Видимость формы
  const [isBlurred, setIsBlurred] = useState(false); // Блюр-эффект
  const [organizations, setOrganizations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false); // Успешная регистрация

  const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;

  useEffect(() => {
    fetch("http://localhost:3001/organizations")
      .then((response) => response.json())
      .then((data) => setOrganizations(data))
      .catch((error) => console.error("Ошибка при получении организаций:", error));

    fetch("http://localhost:3001/roles")
      .then((response) => response.json())
      .then((data) => setRoles(data))
      .catch((error) => console.error("Ошибка при получении ролей:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "contact") {
      const rawValue = value.replace(/\D/g, "");
      const formattedValue = rawValue
        .replace(/^(\d{1,1})/, "+7 (")
        .replace(/^(\+7\s\(\d{3})/, "$1) ")
        .replace(/(\d{3})(\d{2})/, "$1-$2-")
        .slice(0, 18);
      setFormData({ ...formData, contact: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsVisible(false); // Скрываем форму
    setIsBlurred(true); // Активируем блюр

    const newErrors = {
      fullName: !formData.fullName.trim(),
      contact: !phoneRegex.test(formData.contact),
      password: formData.password !== formData.confirmPassword,
      confirmPassword: formData.password !== formData.confirmPassword,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      setIsVisible(true); // Показываем форму, если есть ошибки
      setIsBlurred(false); // Убираем блюр
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FIO: formData.fullName,
          id_organization: formData.organization,
          Bdata: formData.birthDate,
          id_role: formData.role,
          login: formData.contact,
          password: formData.password,
        }),
      });

      if (response.status === 409) {
        setNotification("Пользователь с таким номером телефона уже зарегистрирован!");
        setTimeout(() => {
          setNotification(null);
          setIsVisible(true);
          setIsBlurred(false); // Убираем блюр
        }, 3000);
        return;
      }

      if (response.ok) {
        setNotification("Регистрация успешно завершена!");
        setIsSuccess(true); // Показываем галочку
        setTimeout(() => {
          setNotification(null);
          setIsBlurred(false); // Убираем блюр
          onBack(); // Переход на главный экран
        }, 3000);
      } else {
        setNotification(`Ошибка: ${await response.text()}`);
        setTimeout(() => {
          setNotification(null);
          setIsVisible(true);
          setIsBlurred(false); // Убираем блюр
        }, 3000);
      }
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
      setNotification("Произошла ошибка. Попробуйте снова позже.");
      setTimeout(() => {
        setNotification(null);
        setIsVisible(true);
        setIsBlurred(false); // Убираем блюр
      }, 3000);
    }
  };

  return (
    <>
      {notification && (
        <div className="success-message">
          {notification}
          {isSuccess && <span className="success-icon">✔️</span>}
        </div>
      )}
      <div className={`register-overlay ${isBlurred ? "blurred-background" : ""}`}>
        {isVisible && (
          <form className="register-modal" onSubmit={handleSubmit}>
            <h2>Регистрация</h2>
            <div className="register-content">
              <div className="register-section">
                <div className="form-group">
                  <label>ФИО</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Например: Иванов Иван Иванович"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? "error" : ""}
                  />
                  {errors.fullName && <span className="error-text">Поле должно быть заполнено</span>}
                </div>
                <div className="form-group">
                  <label>Спортивная организация</label>
                  <select
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                  >
                    <option value="">Выберите организацию</option>
                    {organizations.map((org) => (
                      <option key={org.id_organization} value={org.id_organization}>
                        {org.name_organization}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Дата рождения</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Роль</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="">Выберите роль</option>
                    {roles.map((role) => (
                      <option key={role.id_role} value={role.id_role}>
                        {role.name_role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="register-section">
                <div className="form-group">
                  <label>Телефон</label>
                  <input
                    type="text"
                    name="contact"
                    placeholder="+7 (___) ___-__-__"
                    value={formData.contact}
                    onChange={handleChange}
                    className={errors.contact ? "error" : ""}
                  />
                  {errors.contact && (
                    <span className="error-text">Введите номер в формате +7 (9xx)-xxx-xx-xx</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Придумайте пароль</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Введите пароль"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "error" : ""}
                  />
                </div>
                <div className="form-group">
                  <label>Повторите пароль</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Повторите пароль"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? "error" : ""}
                  />
                </div>
              </div>
            </div>
            <div className="form-buttons">
              <button type="button" onClick={onBack}>
                Назад
              </button>
              <button type="submit">Зарегистрироваться</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default Register;
