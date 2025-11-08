# 2Time MVP v6.3 — Pointer links + auto-cleanup
**Что нового**
- Короткая ссылка `/s/:slug` хранит только `{ type:'ptr', timerId }`.
- Публичная страница подтягивает `timers/{id}`. Если таймер удалён — ссылка показывает «Таймер не найден».
- Удаление таймера в приложении также удаляет все ссылки `links` с этим `timerId`.

**Безопасные правила Firestore (клиент создаёт, но не редактирует):**
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /links/{slug} {
      allow read: if true;
      allow create: if request.auth == null && !exists(/databases/$(database)/documents/links/$(slug));
      allow update, delete: if false;
    }
    match /timers/{id} {
      allow read: if true;
      allow create: if request.auth == null && !exists(/databases/$(database)/documents/timers/$(id));
      allow update, delete: if false;
    }
  }
}
```
