# HypeHub Admin для Android

Приложение находится в `android/` и открывает защищённую админку по адресу
`https://hypehub.vercel.app/?admin=1&mobile_app=1`.

## Что уже включено

- Android package: `com.hypehub.admin`
- блокировка отпечатком или системным PIN/паролем;
- повторная блокировка после 60 секунд в фоне;
- запрет скриншотов и записи экрана;
- HttpOnly-сессия админки без пароля внутри APK;
- индикатор отсутствия интернета;
- корректная кнопка «Назад»;
- push для заказов, уведомлений об оплате, поддержки и отзывов;
- переход из push в нужную вкладку;
- фирменные иконка и экран запуска.

## Firebase Cloud Messaging

1. Создайте проект в Firebase Console.
2. Добавьте Android-приложение с package name `com.hypehub.admin`.
3. Скачайте `google-services.json` и положите его в `android/app/google-services.json`.
4. В Firebase откройте Service accounts и создайте приватный ключ.
5. Полное содержимое JSON сервисного аккаунта добавьте в переменную Vercel:
   `FIREBASE_SERVICE_ACCOUNT_JSON`.
6. Выполните миграцию базы через обычный deploy/build проекта.

Никогда не добавляйте `google-services.json`, service-account JSON или keystore
в публичный репозиторий.

## Сборка APK

Нужны Android Studio, Android SDK 36 и JDK 21.

```bash
npm install
npm run android:sync
npm run android:open
```

В Android Studio: `Build` → `Build APK(s)`. Для публикации создайте собственный
release keystore через `Generate Signed Bundle / APK`.

Для локальной debug-сборки:

```bash
npm run android:debug
```

Результат: `android/app/build/outputs/apk/debug/app-debug.apk`.

### Бесплатная сборка через GitHub

В проект добавлен workflow `.github/workflows/android-admin.yml`.

1. В настройках GitHub-репозитория создайте Actions secret
   `FIREBASE_GOOGLE_SERVICES_JSON_BASE64` с содержимым `google-services.json`,
   предварительно закодированным в Base64.
2. Откройте `Actions` → `Build HypeHub Admin APK` → `Run workflow`.
3. После сборки скачайте artifact `HypeHub-Admin-debug`.

## Проверка push

1. Установите приложение и войдите в админку.
2. Разрешите уведомления Android.
3. Откройте «Настройки» в админке.
4. Нажмите «Проверить push-уведомление».

Если Firebase ещё не настроен, кнопка покажет соответствующее сообщение.
