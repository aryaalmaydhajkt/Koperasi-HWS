#!/usr/bin/env bash
echo "======================================================================"
echo "   APLIKASI SISTEM INFORMASI KOPERASI HWS (MAC / LINUX)"
echo "======================================================================"
echo ""

if ! command -v node > /dev/null 2>&1; then
    echo "[ERROR] Node.js belum terpasang di komputer ini!"
    echo "Silakan install Node.js via https://nodejs.org/ atau package manager Anda."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Mengunduh modul aplikasi (hanya sekali di awal)..."
    npm install
fi

echo "Memulai server aplikasi Koperasi HWS..."
echo "Aplikasi berjalan di http://localhost:3000"
echo ""

if command -v xdg-open > /dev/null 2>&1; then
    (sleep 2 && xdg-open http://localhost:3000) &
elif command -v open > /dev/null 2>&1; then
    (sleep 2 && open http://localhost:3000) &
fi

npm run dev
