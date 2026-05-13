# API Endpoints

| Service | Method | Endpoint | Назначение |
|---|---|---|---|
| auth-service | POST | `/api/auth/register` | Регистрация пользователя |
| auth-service | POST | `/api/auth/login` | Авторизация пользователя |
| auth-service | GET | `/api/users/{id}` | Получить пользователя по id |
| auth-service | GET | `/api/admin/users` | Список пользователей (ADMIN) |
| auth-service | PATCH | `/api/admin/users/{id}/ban` | Заблокировать пользователя (ADMIN) |
| auth-service | PATCH | `/api/admin/users/{id}/unban` | Разблокировать пользователя (ADMIN) |
| auth-service | GET | `/health` | Проверка доступности |
| ticket-service | POST | `/api/tickets` | Создать заявку |
| ticket-service | GET | `/api/tickets/{id}` | Получить заявку по id |
| ticket-service | GET | `/api/tickets/user/{userId}` | Получить заявки пользователя |
| ticket-service | GET | `/api/admin/tickets` | Получить все заявки (ADMIN) |
| ticket-service | PATCH | `/api/tickets/{id}/status` | Изменить статус заявки |
| ticket-service | GET | `/api/admin/tickets/statistics` | Статистика заявок (ADMIN) |
| ticket-service | GET | `/health` | Проверка доступности |
| review-service | POST | `/api/reviews` | Оставить отзыв |
| review-service | GET | `/api/reviews/user/{userId}` | Список отзывов пользователя |
| review-service | GET | `/api/reviews/user/{userId}/rating` | Средний рейтинг пользователя |
| review-service | DELETE | `/api/admin/reviews/{id}` | Удалить отзыв (ADMIN) |
| review-service | GET | `/health` | Проверка доступности |
