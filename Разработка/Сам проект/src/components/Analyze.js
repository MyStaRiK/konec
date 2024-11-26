import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Analyze.css";

const Analyze = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sparringId, competitionId, competitionName, weightCategory } = location.state || {}; // Добавлено competitionId

  const [competitionData, setCompetitionData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [ratingAnalysis, setRatingAnalysis] = useState(null);
  const [error, setError] = useState(null);

  // Функция для форматирования даты
  const formatDate = (date) => {
    if (!date) return "Дата неизвестна";
    const months = [
      "января", "февраля", "марта", "апреля", "мая", "июня",
      "июля", "августа", "сентября", "октября", "ноября", "декабря",
    ];
    const parts = date.split("-");
    if (parts.length !== 3) return "Неверный формат даты";
    const [year, month, day] = parts;
    return `${parseInt(year)} ${months[parseInt(month) - 1]} ${parseInt(day)} года`;
  };

  // Получение данных соревнования
  useEffect(() => {
    if (!competitionId) {
      console.error("ID соревнования не предоставлен.");
      return;
    }

    fetch(`http://localhost:3001/competition/${competitionId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка загрузки данных соревнования.");
        }
        return res.json();
      })
      .then((data) => setCompetitionData(data))
      .catch((err) => {
        console.error(err.message);
        setError(err.message);
      });
  }, [competitionId]);

  // Получение данных анализа спарринга
  useEffect(() => {
    if (!sparringId) {
      console.error("ID спарринга не предоставлен.");
      navigate("/competitions");
      return;
    }

    fetch(`http://localhost:3001/analyze/${sparringId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка загрузки данных анализа.");
        }
        return res.json();
      })
      .then((data) => setAnalysisData(data))
      .catch((err) => {
        console.error(err.message);
        setError(err.message);
      });

      fetch(`http://localhost:3001/analyze-rating/${sparringId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Ошибка загрузки данных рейтинга.");
          }
          return res.json();
        })
        .then((data) => setRatingAnalysis(data))
        .catch((err) => {
          console.error(err.message);
          setError(err.message);
        });
      
  }, [sparringId, navigate]);

  if (error) {
    return <div className="analyze-container">Ошибка: {error}</div>;
  }

  if (!analysisData || !competitionData || !ratingAnalysis) {
    return <div className="analyze-container">Загрузка анализа...</div>;
  }

  return (
    <div className="analyze-container">
      <h1>Анализ спарринга</h1>
      <h2>Спарринг между {analysisData.participant1} и {analysisData.participant2}</h2>

      <div className="info-sections">
        {/* Блок информации о турнире */}
        <div className="info-block tournament-block">
          <h3>Информация о турнире</h3>
          <p><strong>Турнир:</strong> {competitionData.competition_name || "Название неизвестно"}</p>
          <p><strong>Дата проведения:</strong> {competitionData ? formatDate(competitionData.Data) : "Дата неизвестна"}</p>
        </div>

        {/* Блок информации о спарринге */}
        <div className="info-block sparring-block">
          <h3>Информация о спарринге</h3>
          <p><strong>Победитель:</strong> {analysisData.winner || "Неизвестно"}</p>
          <p><strong>Способ победы:</strong> {analysisData.victoryMethod || "Неизвестно"}</p>
          <p><strong>Весовая категория:</strong> {weightCategory || "Не указана"}</p>
        </div>
      </div>

      {/* Фото участников */}
      <div className="participants-section">
        <div className="participant">
          <div className="photo-placeholder">
            <img src="/7.png" alt={analysisData.participant1} />
          </div>
          <p className="participant-name">{analysisData.participant1 || "Участник 1"}</p>
          <div className="stats">
          <p className="points">
          <span className="label">Очки за спарринг: </span>{ratingAnalysis.points1 || 0}
          </p>
          <p className="points">
            <span className="label">Рейтинг: </span>
            {ratingAnalysis.score1 >= 0 
                ? `${ratingAnalysis.rating_do1} + ${ratingAnalysis.score1} = ` 
                : `${ratingAnalysis.rating_do1} - ${Math.abs(ratingAnalysis.score1)} = `}
            <span className="final-rating">{ratingAnalysis.rating_po1}</span>
        </p>
        </div>
        </div>
        <div className="participant">
          <div className="photo-placeholder">
            <img src="/9.png" alt={analysisData.participant2} />
          </div>
          <p className="participant-name">{analysisData.participant2 || "Участник 2"}</p>
          <div className="stats">
          <p className="points">
          <span className="label">Очки за спарринг: </span>{ratingAnalysis.points2 || 0}
          </p>
          <p className="points">
            <span className="label">Рейтинг: </span>
            {ratingAnalysis.score2 >= 0 
                ? `${ratingAnalysis.rating_do2} + ${ratingAnalysis.score2} = ` 
                : `${ratingAnalysis.rating_do2} - ${Math.abs(ratingAnalysis.score2)} = `}
            <span className="final-rating">{ratingAnalysis.rating_po2}</span>
        </p>
        </div>
        </div>
      </div>

      <button className="button close" onClick={() => navigate("/competitions")}>
        Закрыть
      </button>
    </div>
  );
};

export default Analyze;
