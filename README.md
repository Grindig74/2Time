# 2Time MVP v6.2 — Short links: retry + trimmed + one-time
**Новое**
- Ретраи при коллизии slug (до 5 попыток, длина слога растёт).
- На публичную ссылку кладём **только нужные поля** (title, kind, bg, и либо endsAt, либо durationMsStr+createdAtMs).
- **Одноразовые ссылки**: при создании можно выбрать; при первом открытии документ удаляется.

**Правила Firestore (минимальные для теста)**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /links/{slug} { allow read, write: if true; } // для MVP
  }
}
```
Потом можно сузить: `allow create: if true; allow read: if resource.data.oneTime == false;` и удалять одноразовые на Cloud Functions.
