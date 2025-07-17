import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'mathquill/build/mathquill.css';

// Declare global window interface
declare global {
  interface Window {
    jQuery: any;
    $: any;
  }
}

// Initialize jQuery and MathQuill
const $ = require('jquery');
window.jQuery = $;
window.$ = $;
require('mathquill/build/mathquill.js');
const MQ = (window as any).MathQuill.getInterface(2);

interface Question {
  content: string;
  id: string;
}

const QuestionPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();
  const mathFieldRef = useRef<any>(null);
  const mathInputRef = useRef<HTMLSpanElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (mathInputRef.current) {
      mathFieldRef.current = MQ.MathField(mathInputRef.current, {
        spaceBehavesLikeTab: true,
        handlers: {
          edit: () => {
            if (mathFieldRef.current) {
              setUserAnswer(mathFieldRef.current.latex());
            }
          }
        }
      });
    }
  }, []);

  const fetchInitialQuestion = useCallback(async (topicId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3002/questions/${topicId}`);
      setCurrentQuestion(response.data);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const topicId = localStorage.getItem('selectedTopic');
    if (!topicId) {
      navigate('/dashboard');
      return;
    }
    fetchInitialQuestion(parseInt(topicId));
  }, [fetchInitialQuestion, navigate]);

  const handleDifficulty = async (isDifficult: boolean) => {
    if (!currentQuestion) return;
    
    const topicId = localStorage.getItem('selectedTopic');
    if (!topicId) {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3002/questions/next', {
        question_id: currentQuestion.id,
        is_difficult: isDifficult,
        category_id: parseInt(topicId)
      });
      
      setCurrentQuestion(response.data);
      setUserAnswer(''); // Reset answer when moving to next question
      if (mathFieldRef.current) {
        mathFieldRef.current.latex('');
      }
      
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

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !userAnswer) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3002/questions/check', {
        question_id: currentQuestion.id,
        answer: userAnswer
      });

      showToast(
        response.data.correct ? 'Correct! Well done!' : 'Not quite right, try again',
        response.data.correct ? 'success' : 'error'
      );

      if (response.data.correct) {
        // Wait a bit before loading next question
        setTimeout(() => handleDifficulty(false), 1500);
      }
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="container text-center">
        <div className="loading-spinner"></div>
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

        <div className="form-group">
          <label className="form-label">Your Answer:</label>
          <div className="mathquill-editor">
            <span ref={mathInputRef}></span>
          </div>
          <button
            className={`button button-primary ${loading ? 'loading' : ''}`}
            onClick={handleSubmitAnswer}
            disabled={loading || !userAnswer}
          >
            Submit Answer
          </button>
        </div>
        
        <div className="mt-4">
          <p className="mb-4" style={{ fontWeight: 'bold' }}>
            How did you find this question?
          </p>
          <button
            className={`button button-outline mr-2 ${loading ? 'loading' : ''}`}
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