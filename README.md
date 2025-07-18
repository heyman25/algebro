# Algebro - Math Practice Platform

A modern web application for practicing mathematics questions with intelligent question recommendations.

## To Run
In terminal:
uvicorn backend:app --reload

In another terminal:
npm i
npm run start

## Features

- User authentication with Supabase
- Intelligent question recommendations based on difficulty feedback
- Beautiful UI with pastel red and yellow theme
- Support for LaTeX math questions
- Real-time difficulty-based question selection

## Project Structure

```
algebro/
├── backend/           # FastAPI backend server
│   ├── main.py       # Main server file
│   ├── requirements.txt
│   └── start.sh      # Server start script
├── algebro-web/      # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
└── README.md
```

## Setup

### Backend Setup

1. Create a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```bash
   ./start.sh
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd algebro-web
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Sign up or log in using your email
3. Select a math topic to practice
4. Answer questions and provide difficulty feedback
5. The system will recommend questions based on your feedback

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Chakra UI
  - Supabase Auth
  - Axios

- Backend:
  - FastAPI
  - Sentence Transformers
  - PyLaTeX
  - Python 3.8+ 
