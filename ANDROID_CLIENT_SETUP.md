# Клиентское Android-приложение ХайпХаб

Это отдельное приложение покупателей. Пакет: `com.hypehub.app`.

## Сборка APK в Android Studio

1. Откройте папку `android-client` как отдельный проект.
2. Дождитесь Gradle Sync.
3. Выберите `Build → Generate App Bundles or APKs → Generate APKs`.
4. APK появится в `android-client/app/build/outputs/apk/debug/app-debug.apk`.

## Подготовка файла для кнопки на сайте

Из корня проекта выполните:

```bash
npm run android:client:publish
```

Команда соберёт APK и скопирует его в:

```text
public/downloads/hypehub.apk
```

После деплоя Vercel кнопка в футере сайта начнёт скачивать этот APK.

При обновлении приложения увеличивайте `versionCode` и `versionName` в `android-client/app/build.gradle`.
