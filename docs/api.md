# API UniThread

## Auth Service

- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход
- `GET /api/users/{id}` — профиль пользователя
- `GET /api/admin/users` — список пользователей (ADMIN)
- `PATCH /api/admin/users/{id}/ban` — бан (ADMIN)
- `PATCH /api/admin/users/{id}/unban` — разбан (ADMIN)

## Question Service (ticket-service)

- `POST /api/questions` — создать вопрос (USER)
- `GET /api/questions` — лента вопросов
- `GET /api/questions/{id}` — получить вопрос
- `GET /api/questions/user/{userId}` — вопросы пользователя
- `PATCH /api/questions/{id}/status` — изменить статус
- `POST /api/questions/{questionId}/comments` — добавить комментарий (USER)
- `GET /api/questions/{questionId}/comments` — список комментариев
- `GET /api/admin/questions` — все вопросы (ADMIN)
- `DELETE /api/admin/questions/{id}` — удалить вопрос (ADMIN)
- `DELETE /api/admin/comments/{commentId}` — удалить комментарий (ADMIN)
- `GET /api/admin/questions/statistics` — статистика по вопросам и комментариям (ADMIN)

## Review Service

- `POST /api/reviews` — оставить отзыв и оценку (USER)
- `GET /api/reviews/user/{userId}` — отзывы пользователя
- `GET /api/reviews/user/{userId}/rating` — средний рейтинг
- `DELETE /api/admin/reviews/{id}` — удалить отзыв (ADMIN)
