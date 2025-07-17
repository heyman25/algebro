import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import QuestionPage from './components/QuestionPage';
import './styles/global.css';
import '@wiris/mathtype-generic/styles.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/question" element={<QuestionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
