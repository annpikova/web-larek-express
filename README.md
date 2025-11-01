# Web-ларёк

Проект интернет-магазина с полным циклом разработки и аудитом безопасности.

## Ссылка на репозиторий

https://github.com/annpikova/web-larek-express

## Информация об авторе

- **Имя:** Анна Пикова
- **Когорта:** 31
- **Курс:** Фулстек-разработчик

## Опубликованная версия проекта

Проект локально запускается через Docker Compose.

## Установка и запуск

### Предварительные требования

- Docker и Docker Compose
- Git

### Запуск проекта

```bash
# Клонировать репозиторий
git clone https://github.com/annpikova/web-larek-express.git

# Перейти в директорию проекта
cd web-larek-express

# Запустить все сервисы
docker-compose up --build
```

Проект будет доступен по адресу: http://localhost

### Структура проекта

- `backend/` - Express.js backend с TypeScript
- `frontend/` - React frontend с TypeScript
- `nginx/` - Nginx reverse proxy
- `docker-compose.yml` - Конфигурация Docker Compose

## Выполненный аудит безопасности

Проект прошел полный аудит безопасности с исправлением всех найденных уязвимостей:

### ✅ Исправленные уязвимости:

1. **XSS (Межсайтовый скриптинг)**
   - React автоматически экранирует весь пользовательский ввод
   - Нет использования `dangerouslySetInnerHTML` в коде

2. **CSRF (Межсайтовая подделка запросов)**
   - Использование JWT токенов в заголовках Authorization
   - Настройка CORS с разрешенными origin

3. **NoSQL-инъекция**
   - Все запросы используют валидацию через Celebrate/Joi
   - ObjectId проверяется через `Types.ObjectId()` перед использованием в запросах
   - Mongoose ORM защищает от инъекций

4. **Переполнение буфера**
   - Установлены лимиты размера тела запроса (1mb для JSON и URL-encoded)
   - Multer настроен с лимитом размера файлов (5MB)

5. **ReDoS (Regular Expression Denial of Service)**
   - Исправлен regex для email валидации с ограничением повторов
   - Используется безопасный паттерн: `/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,10}$/`

6. **DDoS (Distributed Denial of Service)**
   - Добавлен rate limiting (100 запросов/15 минут для API, 10 для auth)
   - Настроена ротация логов (winston-daily-rotate-file)
   - Логи сжимаются и удаляются после определенного срока (14 дней для request, 30 для error)

7. **Path Traversal (Атака через обход директорий)**
   - Исправлен механизм загрузки файлов
   - Файлы сохраняются с использованием UUID для уникальных имен
   - Все пути к файлам проходят через `path.join()` и `path.basename()`

8. **npm-аудит**
   - Все критические и высокие уязвимости исправлены
   - Backend: 0 уязвимостей
   - Frontend: только умеренные уязвимости в dev-зависимостях (esbuild)

9. **ESLint**
   - Код соответствует стандартам Airbnb
   - Все ошибки линтинга исправлены

## Технологический стек

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT для авторизации
- Multer для загрузки файлов
- Celebrate + Joi для валидации
- Winston для логирования
- Express-rate-limit для защиты от DDoS

### Frontend
- React 18
- TypeScript
- Redux Toolkit
- React Router
- Vite
- Sass

### Инфраструктура
- Docker
- Docker Compose
- Nginx

## Лицензия

ISC

