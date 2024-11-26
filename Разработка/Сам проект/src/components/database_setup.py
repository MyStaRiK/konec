import sqlite3

# Создание подключения к базе данных
conn = sqlite3.connect('users.db')  # Имя файла базы данных
cursor = conn.cursor()

# Создание таблицы
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    organization TEXT,
    birth_date TEXT,
    role TEXT NOT NULL,
    contact TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)
''')

print("Таблица 'users' успешно создана.")
conn.commit()
conn.close()
