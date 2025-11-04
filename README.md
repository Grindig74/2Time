# 2Time MVP

Гибрид таймеров и папок с анимированным неоновым интерфейсом. PWA для iPhone (через «На экран Домой»).
Шаринг работает двумя способами:
- **Локальный (по умолчанию):** ссылка вида `/t/local#<payload>` — данные таймера кодируются в ссылке. Работает без сервера.
- **Firebase (опционально):** ссылка вида `/t/<id>` — если заданы `VITE_FIREBASE_*` переменные окружения, таймеры пишутся/читаются из Firestore.

## Быстрый старт (локально)
```bash
npm install
npm run dev
```
Открой `http://localhost:5173`

## Деплой на Vercel (без Git, из ZIP)
1. Перейди на https://vercel.com/new
2. Кнопка **Add New… → Project** → вкладка **Import a Third-Party Git Repository** НЕ нужна. Внизу есть **Deploy from Folder** → **Upload**.
3. Загрузить всю папку проекта (или распакованный ZIP).
4. Настройки по умолчанию (Framework: **Vite**). Нажать **Deploy**.
5. Получишь ссылку вида `https://2time-XXXXX.vercel.app`

### PWA на iPhone
- Открой ссылку в Safari → кнопка **Поделиться** → **На экран “Домой”**.
- Запускай с иконки — интерфейс будет полноэкранным.

## Включить Firebase шаринг (опционально)
1. Создай проект в Firebase Console → добавь веб-приложение.
2. В настройках проекта найди конфиг SDK: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.
3. На Vercel в Project Settings → **Environment Variables** добавь:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Redeploy. Теперь при создании таймера он автоматически сохраняется в Firestore, а расшаренная ссылка `/t/<id>` откроет тот же таймер у получателя.

## Структура
- `src/screens/App.jsx` — главный экран: папки, список таймеров, создание, шаринг.
- `src/screens/TimerPublic.jsx` — публичный просмотр по ссылке.
- `src/components/Backdrop.jsx` — анимированный фон (ночь/рассвет/день/вечер). Звёзды и облака.
- `src/components/TimerCard.jsx` — карточка таймера с обратным отсчётом.
- `src/lib/theme.js` — автоматический выбор фона по названию + градиенты времени суток.
- `src/lib/firebase.js` — необязательная инициализация Firebase/Firestore.
- `public/sw.js` — простой сервис-воркер (кэш базовых файлов).
- `public/manifest.json` — PWA-манифест.

## Примечания
- Загрузка фона из медиатеки: в форме создания можно выбрать изображение, оно применяется локально (без загрузки в облако).
- Папки: создаются вверху, drag&drop реализован минималистично (перемещение можно добавить позже).
- Уведомления и реальная погода/луна не включены в MVP, но архитектура оставляет место для расширения.

Удачи!