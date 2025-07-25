import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'mathquill/build/mathquill.css';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Declare global window interface
declare global {
  interface Window {
    jQuery: any;
    $: any;
    MathQuill: any;
  }
}

// Initialize jQuery and MathQuill
const $ = require('jquery');
window.jQuery = $;
window.$ = $;
require('mathquill/build/mathquill.js');
const MQ = window.MathQuill.getInterface(2);

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

  const insertSymbol = (symbol: string) => {
    if (mathFieldRef.current) {
      mathFieldRef.current.cmd(symbol);
      mathFieldRef.current.focus();
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (mathInputRef.current && !mathFieldRef.current) {
      try {
        mathFieldRef.current = MQ.MathField(mathInputRef.current, {
          spaceBehavesLikeTab: true,
          handlers: {
            edit: () => {
              if (mathFieldRef.current) {
                const latex = mathFieldRef.current.latex();
                setUserAnswer(latex);
              }
            },
            enter: () => {
              if (!loading && userAnswer) {
                handleSubmitAnswer();
              }
            }
          },
          autoCommands: 'pi theta sqrt sum int',
          autoOperatorNames: 'sin cos tan sec csc cot log ln',
        });

        // Set initial focus
        mathFieldRef.current.focus();

        // Cleanup function
        return () => {
          if (mathFieldRef.current) {
            mathFieldRef.current.revert();
            mathFieldRef.current = null;
          }
        };
      } catch (error) {
        console.error('Error initializing MathQuill:', error);
      }
    }
  }, [mathInputRef.current]); // Only re-run if the ref changes

  const fetchInitialQuestion = useCallback(async (topicId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8001/questions/${topicId}`);
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

  const formatMathExpression = (text: string) => {
    return text
      .replace(/\^(\d+)/g, '^{$1}')
      .replace(/(\d+)\/(\d+)π/g, '\\frac{$1}{$2}\\pi')
      .replace(/√\((.*?)\)/g, '\\sqrt{$1}')
      .replace(/\bsin\b/g, '\\sin')
      .replace(/\bcos\b/g, '\\cos')
      .replace(/\btan\b/g, '\\tan')
      .replace(/\bdx\b/g, '\\,dx')
      .replace(/∫_([^∫]*?)(\s|\^)/g, '\\int_{$1}$2')
      .replace(/θ/g, '\\theta')
      .replace(/(\d+|\}|\))([a-zA-Z])/g, '$1\\,$2');
  };

  const renderMathExpression = (text: string) => {
    // Split the text into segments that are either math or text
    const segments = text.split(/((?:sin|cos|tan)\^?\d*θ|[=≤]|∫[^.]+|\([^)]+\)|dy\/dx|\d+\/\d+π|√\([^)]+\))/g);
    
    return segments.map((segment, index) => {
      if (!segment.trim()) return null;

      // Check if this segment is a mathematical expression
      const isMath = /^(?:(?:sin|cos|tan)\^?\d*θ|[=≤]|∫[^.]+|\([^)]+\)|dy\/dx|\d+\/\d+π|√\([^)]+\))$/.test(segment.trim());
      
      if (isMath) {
        const formattedMath = formatMathExpression(segment.trim());
        return <InlineMath key={index}>{formattedMath}</InlineMath>;
      }

      // For text segments that might contain math symbols but aren't complete math expressions
      const textParts = segment.split(/(\s*[=≤]\s*)/);
      return textParts.map((part, partIndex) => {
        if (part.match(/^\s*[=≤]\s*$/)) {
          return <InlineMath key={`${index}-${partIndex}`}>{part.trim()}</InlineMath>;
        }
        return <span key={`${index}-${partIndex}`}>{part}</span>;
      });
    });
  };

  const formatQuestionContent = (content: string) => {
    return content
      .replace(/\[.*?\]/, '') // Remove the reference
      .replace(/verbose,tmargin=.*?rmargin=.*?cm/, '') // Remove the LaTeX parameters
      .replace(/\bnormalemulem\b/, '') // Remove the normalemulem text
      .split('\n') // Split by newlines
      .filter(line => line.trim() !== '') // Remove empty lines
      .filter(line => line.trim() !== '*' && line.trim() !== '.') // Remove lone asterisks and periods
      .join(' ') // Join all lines
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/\.\s*(\[\d+\])/g, ' $1') // Remove period before point values
      .split(/(?<=\]|\.)(?=\s*[A-Z])/) // Split into parts at sentence boundaries
      .map(part => part.trim()) // Trim each part
      .filter(part => part); // Remove empty parts
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
        <div className="question-content">
          <div className="question-metadata">
            <span className="question-reference">{currentQuestion.content.match(/\[.*?\]/)?.[0] || ''}</span>
          </div>
          <div className="question-text">
            {formatQuestionContent(currentQuestion.content).map((part, index) => {
              const cleanedPart = part.trim();
              
              if (cleanedPart.startsWith('Find') || cleanedPart.startsWith('Show')) {
                return (
                  <div key={index} className="question-part">
                    <h3 className="question-subheading">{renderMathExpression(cleanedPart)}</h3>
                  </div>
                );
              }

              return (
                <p key={index} className="question-paragraph">
                  {renderMathExpression(cleanedPart)}
                </p>
              );
            })}
          </div>
        </div>

        <div className="form-group mt-8">
          <label className="form-label">Your Answer:</label>
          <div className="math-input-container">
            <div className="math-toolbar">
              <button type="button" className="math-symbol-btn" onClick={() => insertSymbol('sqrt')} title="Square root">√</button>
              <button type="button" className="math-symbol-btn" onClick={() => insertSymbol('int')} title="Integral">∫</button>
              <button type="button" className="math-symbol-btn" onClick={() => insertSymbol('pi')} title="Pi">π</button>
              <button type="button" className="math-symbol-btn" onClick={() => insertSymbol('theta')} title="Theta">θ</button>
              <button type="button" className="math-symbol-btn" onClick={() => insertSymbol('^')} title="Power">x²</button>
              <button type="button" className="math-symbol-btn" onClick={() => insertSymbol('/')} title="Fraction">⅟</button>
              <div className="math-toolbar-divider"></div>
              <button type="button" className="math-symbol-btn" onClick={() => insertSymbol('sin')} title="Sine">sin</button>
              <button type="button" className="math-symbol-btn" onClick={() => insertSymbol('cos')} title="Cosine">cos</button>
              <button type="button" className="math-symbol-btn" onClick={() => insertSymbol('tan')} title="Tangent">tan</button>
              <div className="math-toolbar-divider"></div>
              <button type="button" className="math-symbol-btn" onClick={() => insertSymbol('sum')} title="Summation">Σ</button>
              <button type="button" className="math-symbol-btn" onClick={() => insertSymbol('infty')} title="Infinity">∞</button>
              <div className="math-toolbar-divider"></div>
              <button type="button" className="math-symbol-btn" onClick={() => insertSymbol(',')} title="Comma">,</button>
            </div>
            <div className="mathquill-editor">
              <span ref={mathInputRef}></span>
            </div>
            <div className="math-input-help">
              <p>Keyboard shortcuts:</p>
              <ul>
                <li>Type <code>/</code> for fractions</li>
                <li>Type <code>sqrt</code> for square root</li>
                <li>Type <code>^</code> for exponents</li>
                <li>Type <code>pi</code> for π</li>
                <li>Type <code>theta</code> for θ</li>
                <li>Type <code>int</code> for ∫</li>
                <li>Separate multiple answers with commas</li>
              </ul>
            </div>
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