# Algebro - Math Practice Platform

A modern web application for practicing mathematics questions with intelligent question recommendations.

## To Run
In terminal:
pip install uvicorn
uvicorn backend:app --reload --port 3002

In another terminal:
cd algebro-web 
npm i
npm run start


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
