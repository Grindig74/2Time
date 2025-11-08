# 2Time v7.1.2 — стабильная погода
Исправления:
- `WeatherProvider.refresh(nextCoords)` — запрос идёт по новым координатам, UI не «чернеет» при смене города.
- `ForecastDrawer` — `z-50`, не скрываем старые данные во время загрузки, явные сообщения `Загружаю…/Ошибка`.
- Включены предыдущие улучшения: sunrise/sunset, moon phase, hourly cloud cover, иконки погоды.

Деплой:
- `npm i && npm run build` → `dist`.
- Проверь **Vercel → Settings → Deployments → Privacy** = *Public* для превью.
- ENV `VITE_FIREBASE_*` без изменений.
