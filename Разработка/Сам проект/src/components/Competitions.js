import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Для перенаправления
import "./Competitions.css";

const Competitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [dates, setDates] = useState([]);
  const [weights, setWeights] = useState([]);
  const [sparrings, setSparrings] = useState([]);

  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedSparring, setSelectedSparring] = useState(null);

  const [selectedCompetitionName, setSelectedCompetitionName] = useState("");
  const [selectedCompetitionDate, setSelectedCompetitionDate] = useState("");
  const [selectedWeightCategory, setSelectedWeightCategory] = useState("");

  const navigate = useNavigate();

  const handleUnderDevelopment = () => {
    alert("Функция находится в разработке. Следите за обновлениями!");
  };

  const handleReset = () => {
    setSelectedCompetition(null);
    setSelectedDate(null);
    setSelectedWeight(null);
    setSelectedSparring(null);
    setSelectedCompetitionName("");
    setSelectedCompetitionDate("");
    setSelectedWeightCategory("");
    setDates([]);
    setWeights([]);
    setSparrings([]);
  };
  // Анализ спарринга
  const handleAnalyze = () => {
    if (!selectedCompetition || !selectedDate || !selectedWeight || !selectedSparring) {
      alert("Пожалуйста, выберите все параметры перед анализом.");
      return;
    }
    navigate("/analyze", {
      state: {
        sparringId: selectedSparring,
        competitionId: selectedCompetition, // Передаем ID соревнования
        competitionName: selectedCompetitionName,
        weightCategory: selectedWeightCategory,
      },
    });
    
  };

  // Загружаем список соревнований из базы данных
  useEffect(() => {
    fetch("http://localhost:3001/competitions")
      .then((res) => res.json())
      .then((data) => setCompetitions(data))
      .catch((err) => console.error("Ошибка загрузки соревнований:", err));
  }, []);

  // Загружаем даты на основе выбранного соревнования
  useEffect(() => {
    if (selectedCompetition) {
      const competition = competitions.find(
        (comp) => comp.id_competition === selectedCompetition
      );
      setSelectedCompetitionName(competition?.competition_name || "");

      fetch(`http://localhost:3001/sparring-dates/${selectedCompetition}`)
        .then((res) => res.json())
        .then((data) => setDates(data))
        .catch((err) => console.error("Ошибка загрузки дат:", err));
    }
  }, [selectedCompetition, competitions]);

  // Загружаем весовые категории на основе выбранной даты
  useEffect(() => {
    if (selectedCompetition && selectedDate) {
      setSelectedCompetitionDate(selectedDate); // Устанавливаем дату

      fetch(`http://localhost:3001/weights/${selectedCompetition}/${selectedDate}`)
        .then((res) => res.json())
        .then((data) => setWeights(data))
        .catch((err) => console.error("Ошибка загрузки весовых категорий:", err));
    }
  }, [selectedCompetition, selectedDate]);

  // Загружаем спарринги на основе выбранной весовой категории
  useEffect(() => {
    if (selectedCompetition && selectedDate && selectedWeight) {
      const weight = weights.find((w) => w.id_weight === parseInt(selectedWeight));
      setSelectedWeightCategory(weight?.value_weight || "");

      fetch(`http://localhost:3001/sparrings/${selectedCompetition}/${selectedDate}/${selectedWeight}`)
        .then((res) => res.json())
        .then((data) => setSparrings(data))
        .catch((err) => console.error("Ошибка загрузки спаррингов:", err));
    }
  }, [selectedCompetition, selectedDate, selectedWeight, weights]);

  return (
    <div className="competitions-container">
      <h1>Здесь вы можете сделать анализ выбранного спарринга!</h1>
      <div className="competitions-content">
        {/* Левая часть - анализ */}
        <div className="competitions-form">
          <h2>Анализ спарринга:</h2>
          <p className="instructions">
            Как пользоваться анализом:
            <ul>
              <li>Выберите соревнование из выпадающего списка.</li>
              <li>Укажите дату спарринга для фильтрации.</li>
              <li>Выберите весовую категорию для отображения участников.</li>
              <li>Выберите конкретный спарринг для анализа.</li>
              <li>Нажмите "Анализировать", чтобы перейти к результатам.</li>
            </ul>
          </p>
          <label htmlFor="competition">Выберите соревнование:</label>
          <select
            id="competition"
            className="form-select"
            value={selectedCompetition || ""}
            onChange={(e) => setSelectedCompetition(parseInt(e.target.value))}
          >
            <option value="">Соревнование</option>
            {competitions.map((comp) => (
              <option key={comp.id_competition} value={comp.id_competition}>
                {comp.competition_name}
              </option>
            ))}
          </select>

          <label htmlFor="date">Выберите дату спарринга:</label>
          <select
            id="date"
            className="form-select"
            value={selectedDate || ""}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={!dates.length}
          >
            <option value="">Дата спарринга</option>
            {dates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>

          <label htmlFor="weight">Выберите весовую категорию:</label>
          <select
            id="weight"
            className="form-select"
            value={selectedWeight || ""}
            onChange={(e) => setSelectedWeight(e.target.value)}
            disabled={!weights.length}
          >
            <option value="">Весовая категория</option>
            {weights.map((weight) => (
              <option key={weight.id_weight} value={weight.id_weight}>
                {weight.value_weight}
              </option>
            ))}
          </select>

          <label htmlFor="sparring">Выберите спарринг:</label>
          <select
            id="sparring"
            className="form-select"
            value={selectedSparring || ""}
            onChange={(e) => setSelectedSparring(parseInt(e.target.value))}
            disabled={!sparrings.length}
          >
            <option value="">Спарринг</option>
            {sparrings.map((spar) => (
              <option key={spar.id} value={spar.id}>
                {spar.description}
              </option>
            ))}
          </select>

          <div className="form-buttons">
            <button className="button cancel" onClick={handleReset}>
              Отмена
            </button>
            <button className="button analyze" onClick={handleAnalyze}>
              Анализировать
            </button>
          </div>
        </div>
        {/* Правая часть - новости */}
        <div className="competitions-news">
          <h2>Предстоящие соревнования:</h2>
          <div className="news-item">
            <h3>
            <a href="/" onClick={(e) => { e.preventDefault(); handleUnderDevelopment(); }}>
                Чемпионат города
              </a>
            </h3>
            <p>
              <strong>Дата:</strong> 25 ноября 2024
            </p>
            <p>
              <strong>Место:</strong> Иркутский спортивный комплекс "Байкал"
            </p>
            <p>Присоединяйтесь к самому ожидаемому событию года. Отличный шанс показать себя!</p>
            <button className="button register" onClick={handleUnderDevelopment}>
              Подать заявку
            </button>
          </div>
          <div className="news-item">
            <h3>
            <a href="/" onClick={(e) => { e.preventDefault(); handleUnderDevelopment(); }}>
                Национальный турнир
              </a>
            </h3>
            <p>
              <strong>Дата:</strong> 15 декабря 2024
            </p>
            <p>
              <strong>Место:</strong> Москва, Лужники
            </p>
            <p>Соберутся лучшие спортсмены страны. Это нельзя пропустить!</p>
            <button className="button register" onClick={handleUnderDevelopment}>
              Подать заявку
            </button>
          </div>
          <div className="news-item">
            <h3>
            <a href="/" onClick={(e) => { e.preventDefault(); handleUnderDevelopment(); }}>
                Международный кубок
              </a>
            </h3>
            <p>
              <strong>Дата:</strong> 10 января 2025
            </p>
            <p>
              <strong>Место:</strong> Санкт-Петербург, Дворец спорта "Юбилейный"
            </p>
            <p>Лучшие бойцы со всего мира соберутся в Санкт-Петербурге для участия в престижном турнире.</p>
            <button className="button register" onClick={handleUnderDevelopment}>
              Подать заявку
            </button>
          </div>
          <div className="news-item">
            <h3>
            <a href="/" onClick={(e) => { e.preventDefault(); handleUnderDevelopment(); }}>
                Открытый чемпионат Сибири
              </a>
            </h3>
            <p>
              <strong>Дата:</strong> 20 февраля 2025
            </p>
            <p>
              <strong>Место:</strong> Новосибирск, Спортивный комплекс "Заря"
            </p>
            <p>Примите участие в крупнейшем региональном событии, которое объединяет спортсменов из всей Сибири.</p>
            <button className="button register" onClick={handleUnderDevelopment}>
              Подать заявку
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Competitions;
