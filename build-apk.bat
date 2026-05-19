@echo off
setlocal EnableDelayedExpansion

echo === MyAgenda APK Build ===

REM Build from project root
cd /d "%~dp0"

REM Ensure Java is available for Gradle
where java >nul 2>nul
if errorlevel 1 (
  echo [0/2] Java not found in PATH. Trying common local locations...

  if exist "C:\Program Files\Android\Android Studio\jbr" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
  ) else if exist "C:\Program Files\Android\Android Studio\jre" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jre"
  ) else if exist "C:\Program Files\Microsoft\jdk-17" (
    set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17"
  ) else (
    for /d %%D in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do (
      if not defined JAVA_HOME set "JAVA_HOME=%%~fD"
    )
  )

  if defined JAVA_HOME (
    set "PATH=!JAVA_HOME!\bin;!PATH!"
    echo [0/2] Using JAVA_HOME=!JAVA_HOME!
  )
)

where java >nul 2>nul
if errorlevel 1 (
  echo.
  echo ERROR: JAVA_HOME is not set and java was not found.
  echo Install JDK 17 or Android Studio, then reopen terminal.
  echo Optional manual fix:
  echo   setx JAVA_HOME "C:\Program Files\Android\Android Studio\jbr"
  echo   setx PATH "%%JAVA_HOME%%\bin;%%PATH%%"
  exit /b 1
)

echo [1/2] Running Expo prebuild for android
REM Non-interactive: malformed android/ is auto-cleared (no Y/n prompt). See Expo CLI isInteractive + CI.
set "CI=1"

REM Stop Gradle/Kotlin daemons so nothing keeps a handle on android\app\build\*.jar (fixes EBUSY).
REM Wrapper may be missing on a broken/partial android\ tree; scripts\stop-gradle-daemons.ps1 still releases locks.
echo [1/2] Stopping Gradle daemons...
if exist android\gradlew.bat (
  pushd android
  call gradlew.bat --stop 2>nul
  popd
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-gradle-daemons.ps1"
timeout /t 2 /nobreak >nul

REM Remove build output so Expo can delete/rebuild android\ without lint-cache locks.
if exist android\app\build (
  echo [1/2] Removing android\app\build
  rd /s /q android\app\build 2>nul
)
if exist android\app\build (
  echo [1/2] Retrying after 3s - close Android Studio if this keeps failing
  timeout /t 3 /nobreak >nul
  rd /s /q android\app\build 2>nul
)
if exist android\app\build (
  echo [1/2] Second JVM stop + 5s wait
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-gradle-daemons.ps1"
  timeout /t 5 /nobreak >nul
  rd /s /q android\app\build 2>nul
)
if exist android\app\build (
  echo.
  echo ERROR: Cannot delete android\app\build - file still in use EBUSY.
  echo Close Android Studio, then delete the folder manually: android\app\build
  echo Or reboot, then run this script again.
  exit /b 1
)

call npx expo prebuild --platform android
if errorlevel 1 (
  echo.
  echo ERROR: expo prebuild failed.
  exit /b 1
)

REM Ensure Android SDK is discoverable by Gradle
set "EXISTING_ANDROID_SDK_ROOT=%ANDROID_SDK_ROOT%"
set "ANDROID_SDK_ROOT="
if defined ANDROID_HOME if exist "%ANDROID_HOME%" set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
if not defined ANDROID_SDK_ROOT if defined EXISTING_ANDROID_SDK_ROOT if exist "%EXISTING_ANDROID_SDK_ROOT%" set "ANDROID_SDK_ROOT=%EXISTING_ANDROID_SDK_ROOT%"
if not defined ANDROID_SDK_ROOT if exist "%LOCALAPPDATA%\Android\Sdk" set "ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk"
if not defined ANDROID_SDK_ROOT if exist "C:\Android\Sdk" set "ANDROID_SDK_ROOT=C:\Android\Sdk"

if not defined ANDROID_SDK_ROOT (
  echo.
  echo ERROR: Android SDK not found.
  echo Install Android SDK via Android Studio and try again.
  exit /b 1
)

set "ANDROID_HOME=%ANDROID_SDK_ROOT%"
set "ANDROID_SDK_ROOT=%ANDROID_SDK_ROOT%"
echo sdk.dir=%ANDROID_SDK_ROOT:\=\\%>android\local.properties
echo [1/2] Using Android SDK at: %ANDROID_SDK_ROOT%

echo [2/2] Building release APK with Gradle...
cd android
call gradlew.bat assembleRelease
if errorlevel 1 (
  echo.
  echo ERROR: Gradle build failed.
  exit /b 1
)

echo.
echo SUCCESS! APK generated at:
echo %~dp0android\app\build\outputs\apk\release\app-release.apk

endlocal
