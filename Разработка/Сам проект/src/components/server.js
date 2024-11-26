const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Подключение к базе данных
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
  } else {
    console.log('Успешное подключение к базе данных.');
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Функция преобразования даты
const formatDateForDatabase = (formattedDate) => {
  const months = {
    января: '01',
    февраля: '02',
    марта: '03',
    апреля: '04',
    мая: '05',
    июня: '06',
    июля: '07',
    августа: '08',
    сентября: '09',
    октября: '10',
    ноября: '11',
    декабря: '12',
  };

  // Если дата уже в формате DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(formattedDate)) {
    return formattedDate;
  }

  const [day, monthName, year] = formattedDate.split(' ');
  if (!day || !monthName || !year || !months[monthName]) {
    console.error(`Invalid date format received: ${formattedDate}`);
    return null; // Возвращаем null при некорректной дате
  }

  const month = months[monthName];
  return `${day.padStart(2, '0')}-${month}-${year}`;
};

// Эндпоинт для регистрации пользователя
app.post('/register', (req, res) => {
  const { FIO, id_organization, Bdata, id_role, login, password } = req.body;

  if (!FIO || !id_organization || !Bdata || !id_role || !login || !password) {
    return res.status(400).json({ error: 'Все поля должны быть заполнены!' });
  }

  const checkQuery = `SELECT login FROM Users WHERE login = ?`;
  db.get(checkQuery, [login], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных: ' + err.message });
    }
    if (row) {
      return res.status(409).json({ error: 'Пользователь с таким номером телефона уже зарегистрирован!' });
    }

    const insertQuery = `
      INSERT INTO Users (FIO, id_organization, Bdata, id_role, login, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.run(insertQuery, [FIO, id_organization, Bdata, id_role, login, password], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при регистрации: ' + err.message });
      }
      res.status(201).json({ message: 'Пользователь успешно зарегистрирован!', userId: this.lastID });
    });
  });
});

// Обработчик для логина
app.post('/login', (req, res) => {
  const { Login, Password } = req.body;

  if (!Login || !Password) {
    return res.status(400).json({ error: 'Все поля должны быть заполнены!' });
  }

  const query = `SELECT password FROM Users WHERE login = ?`;
  db.get(query, [Login], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных: ' + err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Пользователь с таким логином не существует!' });
    }
    if (row.password !== Password) {
      return res.status(401).json({ error: 'Неверный пароль!' });
    }
    res.status(200).json({ message: 'Успешный вход!' });
  });
});

// Эндпоинт для получения данных профиля
app.post('/profile', (req, res) => {
  const { Login } = req.body;

  if (!Login) {
    return res.status(400).json({ error: 'Логин не предоставлен!' });
  }

  const query = `
    SELECT Users.FIO, Users.Bdata, Organizations.name_organization AS organization
    FROM Users
    LEFT JOIN Organizations ON Users.id_organization = Organizations.id_organization
    WHERE Users.login = ?
  `;
  db.get(query, [Login], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных: ' + err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Пользователь с таким логином не найден!' });
    }
    res.status(200).json(row);
  });
});

// Эндпоинт для получения списка ролей
app.get('/roles', (req, res) => {
  const query = 'SELECT id_role, name_role FROM Roles';
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при получении ролей: ' + err.message });
    }
    res.status(200).json(rows);
  });
});

// Эндпоинт для получения списка организаций
app.get('/organizations', (req, res) => {
  const query = 'SELECT id_organization, name_organization FROM Organizations';
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при получении организаций: ' + err.message });
    }
    res.status(200).json(rows);
  });
});

// Получить список соревнований
app.get('/competitions', (req, res) => {
  const query = `SELECT id_competition, competition_name FROM Competitions`;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения данных соревнований: ' + err.message });
    }
    res.status(200).json(rows);
  });
});

// Получить даты спаррингов по соревнованию
app.get('/sparring-dates/:competitionId', (req, res) => {
  const { competitionId } = req.params;
  const query = `
    SELECT DISTINCT date FROM Sparrings WHERE id_competition = ? ORDER BY date
  `;
  db.all(query, [competitionId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения дат спаррингов: ' + err.message });
    }
    const formattedDates = rows.map(row => {
      const [day, month, year] = row.date.split('-');
      if (!day || !month || !year) {
        return 'Invalid Date';
      }
      const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ];
      return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year} года`;
    });
    res.status(200).json(formattedDates);
  });
});

// Получить весовые категории по дате и соревнованию
app.get('/weights/:competitionId/:date', (req, res) => {
  const { competitionId, date } = req.params;
  const formattedDate = formatDateForDatabase(date);

  if (!formattedDate) {
    return res.status(400).json({ error: 'Некорректный формат даты.' });
  }

  const query = `
    SELECT DISTINCT Weights.id_weight, Weights.value_weight
    FROM Sparrings
    JOIN Weights ON Sparrings.id_weight = Weights.id_weight
    WHERE Sparrings.id_competition = ? AND Sparrings.date = ?;
  `;
  db.all(query, [competitionId, formattedDate], (err, rows) => {
    if (err) {
      console.error('Ошибка выполнения SQL-запроса:', err.message);
      return res.status(500).json({ error: 'Ошибка получения весовых категорий: ' + err.message });
    }
    res.status(200).json(rows);
  });
});

// Получить спарринги по весовой категории
app.get('/sparrings/:competitionId/:date/:weightId', (req, res) => {
  const { competitionId, date, weightId } = req.params;
  const formattedDate = formatDateForDatabase(date);

  if (!formattedDate) {
    return res.status(400).json({ error: 'Некорректный формат даты.' });
  }

  const query = `
    SELECT Sparrings.id_sparring, p1.FIO AS participant1, p2.FIO AS participant2
    FROM Sparrings
    JOIN Participants p1 ON Sparrings.id_participant1 = p1.id_participant
    JOIN Participants p2 ON Sparrings.id_participant2 = p2.id_participant
    WHERE Sparrings.id_competition = ? AND Sparrings.date = ? AND Sparrings.id_weight = ?;
  `;
  db.all(query, [competitionId, formattedDate, weightId], (err, rows) => {
    if (err) {
      console.error('Ошибка выполнения SQL-запроса:', err.message);
      return res.status(500).json({ error: 'Ошибка получения спаррингов: ' + err.message });
    }
    const formattedSparrings = rows.map(row => ({
      id: row.id_sparring,
      description: `Спарринг между ${row.participant1.split(' ')[0]} и ${row.participant2.split(' ')[0]}`,
    }));
    res.status(200).json(formattedSparrings);
  });
});

// Эндпоинт для анализа конкретного спарринга
app.get('/analyze/:sparringId', (req, res) => {
  const { sparringId } = req.params;

  const query = `
    SELECT 
      Sparrings.id_sparring, 
      p1.FIO AS participant1, 
      p2.FIO AS participant2,
      Victory.name_victory AS victory_method, -- Тип победы
      winner.FIO AS winner_name,             -- Победитель
      loser.FIO AS loser_name,               -- Проигравший
      Sparrings.Points1,                     -- Очки первого участника
      Sparrings.Points2                      -- Очки второго участника
    FROM Sparrings
    JOIN Participants p1 ON Sparrings.id_participant1 = p1.id_participant
    JOIN Participants p2 ON Sparrings.id_participant2 = p2.id_participant
    JOIN Victory ON Sparrings.id_victory = Victory.id_victory
    JOIN Participants winner ON Sparrings.id_win = winner.id_participant
    JOIN Participants loser ON Sparrings.id_lose = loser.id_participant
    WHERE Sparrings.id_sparring = ?;
  `;

  db.get(query, [sparringId], (err, row) => {
    if (err) {
      console.error('Ошибка выполнения SQL-запроса:', err.message);
      return res.status(500).json({ error: 'Ошибка получения данных анализа: ' + err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Спарринг не найден.' });
    }

    // Формируем ответ
    res.status(200).json({
      sparringId: row.id_sparring,
      participant1: row.participant1,
      participant2: row.participant2,
      victoryMethod: row.victory_method,
      winner: row.winner_name,
      loser: row.loser_name,
      points1: row.Points1,
      points2: row.Points2,
    });
  });
});


// Получение информации о соревновании по ID
app.get('/competition/:id', (req, res) => {
  const competitionId = req.params.id;

  const query = `
    SELECT competition_name, Data, id_importance 
    FROM Competitions 
    WHERE id_competition = ?
  `;

  db.get(query, [competitionId], (err, row) => {
    if (err) {
      console.error('Ошибка выполнения SQL-запроса:', err.message);
      res.status(500).json({ error: 'Ошибка базы данных' });
    } else if (!row) {
      res.status(404).json({ error: 'Соревнование не найдено' });
    } else {
      res.status(200).json(row);
    }
  });
});

// Эндпоинт для расчета и сохранения анализа рейтинга
app.post('/analyze-rating/:sparringId', (req, res) => {
  const { sparringId } = req.params;

  const sparringQuery = `
    SELECT 
      Sparrings.id_sparring,
      Sparrings.id_participant1,
      Sparrings.id_participant2,
      Participants1.rating AS rating_do1,
      Participants2.rating AS rating_do2,
      Sparrings.id_win,
      Sparrings.Points1, -- Очки первого участника
      Sparrings.Points2, -- Очки второго участника
      Competitions.id_importance,
      Importance.value AS K -- Коэффициент важности
    FROM Sparrings
    JOIN Participants AS Participants1 ON Sparrings.id_participant1 = Participants1.id_participant
    JOIN Participants AS Participants2 ON Sparrings.id_participant2 = Participants2.id_participant
    JOIN Competitions ON Sparrings.id_competition = Competitions.id_competition
    JOIN Importance ON Competitions.id_importance = Importance.id_importance
    WHERE Sparrings.id_sparring = ?;
  `;

  db.get(sparringQuery, [sparringId], (err, sparringData) => {
    if (err) {
      console.error('Ошибка получения данных о спарринге:', err.message);
      return res.status(500).json({ error: 'Ошибка базы данных.' });
    }

    if (!sparringData) {
      return res.status(404).json({ error: 'Спарринг не найден.' });
    }

    const {
      id_participant1,
      id_participant2,
      rating_do1,
      rating_do2,
      id_win,
      Points1,
      Points2,
      K
    } = sparringData;

    const coefficient = K || 20;

    // Проверяем существование анализа
    const checkAnalyzeQuery = `
      SELECT rating_do1, rating_do2, rating_po1, rating_po2 
      FROM Analyze 
      WHERE id_sparring = ?
    `;

    db.get(checkAnalyzeQuery, [sparringId], (err, analyzeData) => {
      if (err) {
        console.error('Ошибка проверки данных анализа:', err.message);
        return res.status(500).json({ error: 'Ошибка базы данных.' });
      }

      // Если анализ уже выполнен
      if (analyzeData && analyzeData.rating_po1 !== null && analyzeData.rating_po2 !== null) {
        return res.status(200).json({
          message: 'Анализ уже выполнен ранее.',
          sparringId,
          rating_do1: analyzeData.rating_do1,
          rating_do2: analyzeData.rating_do2,
          rating_po1: analyzeData.rating_po1,
          rating_po2: analyzeData.rating_po2,
          points1: Points1,
          points2: Points2,
          score1: null, // Изменение не рассчитывается повторно
          score2: null
        });
      }

      // Рассчитываем изменение рейтинга
      const expectedResult1 = 1 / (1 + Math.pow(10, (rating_do2 - rating_do1) / 400));
      const expectedResult2 = 1 / (1 + Math.pow(10, (rating_do1 - rating_do2) / 400));

      const S1 = id_win === id_participant1 ? 1 : 0;
      const S2 = id_win === id_participant2 ? 1 : 0;

      const score1 = Math.round(coefficient * (S1 - expectedResult1));
      const score2 = Math.round(coefficient * (S2 - expectedResult2));

      const R_new1 = rating_do1 + score1;
      const R_new2 = rating_do2 + score2;

      const query = analyzeData
        ? `UPDATE Analyze SET rating_po1 = ?, rating_po2 = ?, rating_do1 = ?, rating_do2 = ? WHERE id_sparring = ?`
        : `INSERT INTO Analyze (id_sparring, rating_do1, rating_do2, rating_po1, rating_po2) VALUES (?, ?, ?, ?, ?)`;

      const params = analyzeData
        ? [R_new1, R_new2, rating_do1, rating_do2, sparringId]
        : [sparringId, rating_do1, rating_do2, R_new1, R_new2];

      db.run(query, params, (err) => {
        if (err) {
          console.error('Ошибка сохранения анализа:', err.message);
          return res.status(500).json({ error: 'Ошибка базы данных.' });
        }

        const updateParticipantsQuery = `
          UPDATE Participants
          SET rating = CASE id_participant
            WHEN ? THEN ?
            WHEN ? THEN ?
          END
          WHERE id_participant IN (?, ?)
        `;

        db.run(updateParticipantsQuery, [id_participant1, R_new1, id_participant2, R_new2, id_participant1, id_participant2], (err) => {
          if (err) {
            console.error('Ошибка обновления рейтинга участников:', err.message);
            return res.status(500).json({ error: 'Ошибка обновления данных участников.' });
          }

          return res.status(201).json({
            message: 'Данные анализа успешно сохранены.',
            sparringId,
            rating_do1,
            rating_do2,
            rating_po1: R_new1,
            rating_po2: R_new2,
            points1: Points1,
            points2: Points2,
            score1,
            score2
          });
        });
      });
    });
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
