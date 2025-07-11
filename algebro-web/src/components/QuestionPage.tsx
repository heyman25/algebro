import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Question {
  content: string;
  id: string;
}

const QuestionPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const topicId = localStorage.getItem('selectedTopic');
    if (!topicId) {
      navigate('/dashboard');
      return;
    }
    fetchInitialQuestion(parseInt(topicId));
  }, []);

  const fetchInitialQuestion = async (topicId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/questions/${topicId}`);
      setCurrentQuestion(response.data);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDifficulty = async (isDifficult: boolean) => {
    if (!currentQuestion) return;
    
    const topicId = localStorage.getItem('selectedTopic');
    if (!topicId) {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/questions/next', {
        question_id: currentQuestion.id,
        is_difficult: isDifficult,
        category_id: parseInt(topicId)
      });
      
      setCurrentQuestion(response.data);
      
      showToast(
        isDifficult ? 'Getting a similar question...' : 'Getting a different question...',
        'success'
      );
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="container text-center">
        <p>Loading question...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="box">
        <h2 className="heading">Question</h2>
        <p className="mb-4" style={{ whiteSpace: 'pre-wrap' }}>
          {currentQuestion.content}
        </p>
        
        <div className="mt-4">
          <p className="mb-4" style={{ fontWeight: 'bold' }}>
            How did you find this question?
          </p>
          <button
            className={`button button-primary mr-2 ${loading ? 'loading' : ''}`}
            onClick={() => handleDifficulty(true)}
            disabled={loading}
            style={{ width: 'auto', display: 'inline-block' }}
          >
            Difficult
          </button>
          <button
            className={`button button-outline ${loading ? 'loading' : ''}`}
            onClick={() => handleDifficulty(false)}
            disabled={loading}
            style={{ width: 'auto', display: 'inline-block' }}
          >
            Easy
          </button>
        </div>
      </div>

      <button
        className="button button-ghost mt-4"
        onClick={() => navigate('/dashboard')}
      >
        Back to Topics
      </button>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default QuestionPage; 