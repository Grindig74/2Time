# 2Time MVP v3
- Drag&Drop таймеров на папки (и в «Все» для снятия папки).
- .ICS теперь с локальной TZ (TZID) и корректным daily-временем.
- Ссылки «Поделиться»: `/t/local?d=...` (короче, открываются везде).
- Папки: rename/emoji/delete. Таймеры: перенос через меню и DnD.
- PWA и SPA rewrites в `vercel.json`.

Вкл. пуши позже: добавим VAPID и серверный endpoint, чтобы присылать Web Push (iOS поддерживает в PWA).
