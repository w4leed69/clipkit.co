#!/bin/bash

echo "🚀 Starting ReelSaver..."

# Start backend
echo "📦 Starting backend on http://localhost:8000"
cd "$(dirname "$0")/backend"
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend
echo "🎨 Starting frontend on http://localhost:5173"
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "   Frontend → http://localhost:5173"
echo "   Backend  → http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped.'" EXIT
wait
