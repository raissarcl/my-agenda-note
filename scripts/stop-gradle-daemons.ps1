# Stops Gradle/Kotlin compiler daemon JVMs so Windows can delete android\app\build (EBUSY).
# Safe to run when no Gradle build is in progress; does not stop the Android Studio IDE JVM.
Get-CimInstance Win32_Process -Filter "Name = 'java.exe'" -ErrorAction SilentlyContinue |
  Where-Object {
    $_.CommandLine -and (
      $_.CommandLine -match 'GradleDaemon|KotlinCompileDaemon|kotlin\.daemon'
    )
  } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
