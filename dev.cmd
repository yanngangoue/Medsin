@echo off
REM Toujours partir du dossier où se trouve ce fichier (évite ENOENT depuis System32).
cd /d "%~dp0"

if not exist "package.json" (
  echo [ERREUR] package.json introuvable ici : %CD%
  echo Place ce fichier dans le dossier Medsim du projet.
  pause
  exit /b 1
)

echo.
echo Dossier : %CD%
echo Medsim — http://localhost:3001
echo Appuyez sur Ctrl+C pour arrêter.
echo.

call npm run dev
set EXIT=%ERRORLEVEL%
if not "%EXIT%"=="0" (
  echo.
  echo [ERREUR] npm run dev a echoue ^(code %EXIT%^).
  pause
)
exit /b %EXIT%
