import React from 'react';
import { useNavigate } from 'react-router-dom';

const topics = [
  { id: 1, name: 'Functions and Graphs', path: 'Functions_and_graphs' },
  { id: 2, name: 'Sequences and Series', path: 'Sequences_and_series' },
  { id: 3, name: 'Vectors', path: 'Vectors' },
  { id: 4, name: 'Intro to Complex Numbers', path: 'Intro_to_complex_numbers' },
  { id: 5, name: 'Calculus', path: 'Calculus' },
  { id: 6, name: 'Probability and Stats', path: 'Probability_and_Stats' },
  { id: 7, name: 'Random', path: 'Random' },
];

const Dashboard = () => {
  const navigate = useNavigate();

  const handleTopicSelect = (topicId: number) => {
    localStorage.setItem('selectedTopic', topicId.toString());
    navigate('/question');
  };

  return (
    <div className="container">
      <div className="text-center mb-4">
        <h1 className="heading">Choose a Topic</h1>
        <p>Select a mathematics topic to practice</p>
      </div>

      <div className="grid">
        {topics.map((topic) => (
          <div key={topic.id} className="topic-card">
            <h2 className="topic-title">{topic.name}</h2>
            <button
              className="button button-primary"
              onClick={() => handleTopicSelect(topic.id)}
            >
              Start Practice
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 