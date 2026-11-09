# Building the AI Trainer Android APK

Project: Expo / React Native app in `android/` (package `com.aitrainer.app`, RN 0.88.1, Expo SDK 58).

## Recommended: build on EAS (cloud)

The local Gradle build currently fails (see "Known issue" below), so use EAS Build. A first build takes about 15–30 minutes.

1. Log in to Expo, or provide a token. Tokens are read from `EXPO_TOKEN`; never commit one.
   ```bash
   npx eas-cli login
   ```
   Or, for automation, put `EXPO_TOKEN=...` in an env file outside the repo and load it before running commands.

2. Build the APK from the `android/` directory:
   ```bash
   cd /home/nij/test/AI-Trainer/android
   npx eas-cli build --platform android --profile preview
   ```

3. Download the APK from the link EAS prints, or run `npx eas-cli build:view <build-id>` to see the `Application Archive URL`.

4. Install on a device:
   ```bash
   adb install -r dist/ai-trainer-preview.apk
   ```
   Or copy the file to the phone and open it (allow "Install unknown apps").

Profiles in `eas.json`:
- `preview`: APK for internal testing.
- `production`: Android app bundle (`.aab`) for the Play Store.
- `development`: development client build.

### Upload notes

EAS uploads files that git would keep. Its matcher is case-insensitive, so the root `.gitignore` rule `Data/` drops every `data/` folder. The root `.gitignore` therefore re-includes the two app folders that need it:
```
!android/src/features/language-learner/data/
!android/src/features/dashboard/data/
```
If you add another `data/` folder that the app imports, add a similar negation rule.

## Local build (currently blocked)

Requirements: JDK 21, Android SDK (platform 36, build-tools 36.0.0), and NDK `27.1.12297006`.

```bash
cd /home/nij/test/AI-Trainer/android
npm install
npx expo prebuild --platform android --clean
printf "sdk.dir=$HOME/Android/Sdk\n" > android/local.properties
cd android
./gradlew assembleRelease --no-daemon
```

The APK would be written to `android/android/app/build/outputs/apk/release/`.

## Known issue: minSdk 22 vs 24 (local build only)

`./gradlew assembleRelease` fails in `:react-native-screens:configureCMakeRelWithDebInfo[arm64-v8a]` and `:react-native-worklets:configureCMakeRelWithDebInfo[arm64-v8a]`:

```
User has minSdkVersion 22 but library was built for 24 [//ReactAndroid/hermestooling]
```

The app and both libraries report minSdk 24, but the generated CMake platform is `android-22`. Things tried without success:
- `minSdkVersion` 24 via `expo-build-properties` in `app.json` and `gradle.properties`.
- Forcing `minSdk` 24 on library modules.
- `-DANDROID_PLATFORM=android-24` in CMake arguments (AGP overrides it).
- Root `build.gradle` `ext { minSdkVersion = 24 }`.
- NDK 26 and NDK 27.
- Clearing native `build/` and `.cxx/` caches.
- Latest published versions of react-native-screens 4.30.1 and react-native-worklets 0.13.1.

EAS builds are not affected. Next step for local builds: report the issue to react-native-screens / Expo, or try a different AGP/React Native combination.
