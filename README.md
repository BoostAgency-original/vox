# Vox — Анализ голосовой совместимости

Сервис для анализа совместимости пар по стилю речи. Пользователи загружают голосовые записи, AI анализирует 8 параметров речи и рассчитывает показатели комфорта и интереса.

## Стек

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: NestJS 10, TypeORM, PostgreSQL
- **AI**: OpenAI Whisper-1, GPT-5.2
- **Infra**: Docker, Turborepo monorepo

## Структура проекта

```
vox/
├── apps/
│   ├── api/          # NestJS backend (порт 3001)
│   └── web/          # Next.js frontend (порт 3000)
├── packages/
│   └── shared/       # Общие типы и константы
├── docker/           # Docker конфигурации
└── turbo.json        # Turborepo конфигурация
```

## Быстрый старт

### 1. Установка зависимостей

```bash
bun install
```

### 2. Настройка окружения

Скопируйте `env.example` в `.env` и заполните:

```bash
cp env.example .env
```

Обязательные переменные:
- `DATABASE_URL` — PostgreSQL подключение
- `OPENAI_API_KEY` — ключ OpenAI API

### 3. Запуск PostgreSQL

**С Docker:**
```bash
bun run docker:dev
```

**Или вручную:**
```bash
# PostgreSQL должен быть запущен на localhost:5432
# База данных: vox
# Пользователь: postgres
# Пароль: 3141
```

### 4. Запуск в dev режиме

```bash
bun run dev
```

Откроется:
- Frontend: http://localhost:3000
- API: http://localhost:3001/api

## API Endpoints

### Sessions
- `POST /api/sessions` — создать сессию
- `GET /api/sessions/:id` — получить сессию
- `GET /api/sessions/:id/status` — статус сессии

### Recordings
- `POST /api/recordings` — загрузить аудио (multipart/form-data)
- `GET /api/recordings/:id` — получить запись

### Analysis
- `POST /api/analysis/:sessionId` — запустить анализ
- `GET /api/analysis/results/:sessionId` — получить результаты

### Admin
- `POST /api/admin/login` — авторизация
- `GET /api/admin/stats` — статистика
- `GET /api/admin/sessions` — список сессий
- `GET /api/admin/sessions/:id` — детали сессии
- `GET /api/admin/export` — экспорт CSV

## Страницы

| URL | Описание |
|-----|----------|
| `/` | Главная — ввод email и имён |
| `/analyze/:sessionId` | Запись/загрузка аудио |
| `/results/:sessionId` | Результаты анализа |
| `/admin/login` | Вход в админку |
| `/admin` | Админ-панель |

## Анализируемые параметры

1. **Скорость речи** — слов/мин
2. **Богатство словаря** — TTR (Type-Token Ratio)
3. **Плотность пауз** — % времени в паузах
4. **Глубина пауз** — макс. длительность паузы
5. **Склонность к повторам** — макс. повторов слова подряд
6. **Слова-паразиты** — % слов-паразитов
7. **Эмоциональная резкость** — % грубой лексики
8. **Длина фразы** — среднее слов между паузами

## Формулы совместимости

### Комфорт
```
Комфорт(A←B) = 0.5 × BaseComfort(B) + 0.5 × SimilarityComfort(A←B)
```

### Интерес
```
Интерес(A←B) = NoveltyPref(A) × BaseDrive + (1-NoveltyPref(A)) × Comfort
```

## Лицензия

Проприетарный код. Все права защищены.

