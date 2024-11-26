import React from 'react';
import './Main.css';

const Main = ({ onNavigateToRegister }) => {
  const handleUnderDevelopment = () => {
    alert("Функция находится в разработке. Следите за обновлениями!");
  };

  return (
    <main className="main">
      <section className="intro-slider">
        <div className="intro-content">
          <img src="/611903.jpg" alt="Логотип ИРНИТУ" className="logo-irnitu" />
          <div className="intro-text">
            <h1>Добро пожаловать на сайт бокса Иркутского национального технического университета!</h1>
            <p>
              Здесь вы можете просмотреть актуальную информацию, связанную с боксом
              нашего университета, зарегистрироваться на соревнования, посмотреть
              судей и наших тренеров!
            </p>
          </div>
        </div>
        <div className="section-description">
          <h2>О нашей секции бокса</h2>
          <div className="section-content">
            <div>
              <p>
                <strong>Секция бокса в ИРНИТУ</strong> предоставляет отличные возможности для студентов, 
                желающих развить свои <strong>физические</strong> и <strong>ментальные способности</strong>. 
                <span className="highlight"> Бокс</span> — это не только спорт, но и способ самореализации, 
                развитие дисциплины, уверенности в себе и целеустремленности.
              </p>
              <ul>
                <li><strong>Профессиональные тренеры</strong>, которые помогут достичь успеха.</li>
                <li>Возможность участвовать в соревнованиях различного уровня.</li>
                <li>Дружная команда, где каждый найдет поддержку и мотивацию.</li>
              </ul>
              <p>
                Мы приглашаем <strong>всех желающих</strong>, независимо от уровня подготовки. 
                Секция бокса — это не только тренировки, но и ваш путь к успеху. 
                Присоединяйтесь уже сегодня и станьте частью <span className="highlight">нашей большой семьи!</span>
              </p>
            </div>
            <img src="/5.jpg" alt="Изображение секции бокса" />
          </div>
        </div>
      </section>

      <section className="info-blocks">
        <div className="info">
          <h2>Ближайшие соревнования</h2>
          <img src="/1.jpg" alt="Ближайшие соревнования" className="info-img" />
          <button onClick={handleUnderDevelopment}>Перейти</button>
        </div>
        <div className="info">
          <h2>Последние новости</h2>
          <img src="/2.jpg" alt="Последние новости" className="info-img" />
          <button onClick={handleUnderDevelopment}>Перейти</button>
        </div>
        <div className="info">
          <h2>Предложения и связь</h2>
          <img src="/3.jpg" alt="Предложения и связь" className="info-img" />
          <button onClick={handleUnderDevelopment}>Перейти</button>
        </div>
        <div className="info">
          <h2>Зарегистрироваться</h2>
          <img src="/4.jpg" alt="Зарегистрироваться" className="info-img" />
          <button onClick={onNavigateToRegister}>Перейти</button>
        </div>
      </section>
    </main>
  );
};

export default Main;
