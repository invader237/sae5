# 🚀 Build Expo Android Release Locally (Android Studio)

> 🎯 Goal: Build a **release APK/AAB locally** for an Expo app **without using Expo Cloud / EAS**.

---

## 🧩 Prerequisites

- 🟢 Node.js installed
- 🟢 Java JDK 17+
- 🟢 Android Studio installed
- 🟢 Android SDK installed via Android Studio
- 🟢 A working Expo project

---

## 📁 Project Structure

After prebuild, your project must contain:

```
front/
├─ android/
├─ app.config.js
├─ package.json
```

---

## 🔧 Android SDK Configuration

### 1️⃣ Locate Android SDK

Default path on Windows:

```
C:\Users\<USERNAME>\AppData\Local\Android\Sdk
```

---

### 2️⃣ Configure `local.properties`

File:
```
android/local.properties
```

Content:
```properties
sdk.dir=C:\Users\<USERNAME>\AppData\Local\Android\Sdk
```

---

## 🏗️ Generate Native Android Project

```bash
npx expo prebuild --platform android
```

---

## 🧪 Build Debug APK

```bash
cd android
./gradlew assembleDebug
```

---

## 🏭 Build Release APK (Android Studio)

```
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

---

## 🔐 Sign Release APK

```bash
keytool -genkeypair -v \
  -keystore my-release-key.keystore \
  -alias my-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

---

## 📦 Build Signed APK

```bash
./gradlew assembleRelease
```

---

## 📦 Build AAB (Play Store)

```bash
./gradlew bundleRelease
```

---

## 📱 Install APK

go to `.\android\app\build\outputs\apk\release` and then :

```bash
adb install app-release.apk
```

---

## ✅ Summary

| Task | Command |
|----|----|
| Prebuild | npx expo prebuild |
| Debug APK | ./gradlew assembleDebug |
| Release APK | ./gradlew assembleRelease |
| Release AAB | ./gradlew bundleRelease |

---

Happy building 🚀
