@echo off
title Koperasi HWS - Local Server
color 0A
echo ======================================================================
echo    APLIKASI SISTEM INFORMASI KOPERASI HWS (LAPTOP / KOMPUTER)
echo ======================================================================
echo.
echo Memeriksa instalasi Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js belum terpasang di laptop ini!
    echo Silakan unduh dan install Node.js terlebih dahulu di: https://nodejs.org/
    echo Setelah selesai menginstall, buka kembali file ini.
    echo.
    pause
    exit /b
)

if not exist node_modules (
    echo Mengunduh dan menginstall modul aplikasi (hanya sekali di awal)...
    call npm install
)

echo Memulai server aplikasi Koperasi HWS...
echo Aplikasi akan terbuka otomatis di browser Anda di http://localhost:3000
echo.

start "" "http://localhost:3000"
npm run dev

pause
