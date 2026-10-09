# MERN PDF Dashboard

This project is a full-stack MERN application scaffold built as a modern dashboard experience. The workspace was empty, so this code creates a working base with a Node/Express API and a React + Vite frontend.

## Features

- Responsive dashboard layout
- Express API with sample data
- React frontend with cards, activity feed, and charts
- Optional MongoDB connection support via environment variables

## Quick start

1. Install dependencies:
   npm install
   npm --prefix client install
2. Start the app:
   npm run dev
3. Open the frontend in the browser at http://localhost:5173
4. API is available at http://localhost:5000/api/dashboard

## Environment

Create a .env file in the project root with:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-dashboard

If MongoDB is unavailable, the server will continue using sample data.
