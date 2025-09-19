import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './QuizPerformance.css';

// Simple bar chart component
function BarChart({ data, title, xAxisLabel, yAxisLabel }) {
  const maxValue = Math.max(...data.map(item => item.value), 0);
  
  return (
    <div className="chart-card">
      <div className="chart-header">{title}</div>
      <div className="chart-body">
        <div className="bar-chart-container">
          {data.map((item, index) => (
            <div key={index} className="bar-chart-item">
              <div 
                className="bar-chart-bar" 
                style={{ 
                  height: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%',
                }}
              ></div>
              <div className="bar-chart-label">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="text-center small text-muted mt-3">{yAxisLabel}</div>
      </div>
    </div>
  );
}

function QuizPerformance() {
  const { token, user } = useAuth();
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load quiz performance data
    loadQuizPerformance();
  }, [user]);

  const loadQuizPerformance = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:5000/api/quizzes/performance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQuizData(data.data);
      } else {
        setError(data.message || 'Failed to load quiz performance data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Failed to load quiz performance:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const isAdmin = user && user.email === 'admin@skillbarter.com';

  if (loading) {
    return (
      <div className="p-4 p-md-5 quiz-performance-container">
        <div className="loading-container">
          <div className="spinner-border text-primary loading-spinner" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-3">Loading quiz performance data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 p-md-5 quiz-performance-container">
        <div className="alert alert-danger error-container" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <span>{error}</span>
          </div>
          <button 
            className="btn btn-outline-danger btn-sm ms-3 retry-button" 
            onClick={loadQuizPerformance}
          >
            <i className="bi bi-arrow-repeat me-1"></i>Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 p-md-5 quiz-performance-container">
      <div className="quiz-performance-header">
        <h2 className="h4 mb-0">
          <i className="bi bi-bar-chart me-2"></i>Quiz Performance Analysis
        </h2>
      </div>
      
      {quizData.length === 0 ? (
        <div className="alert alert-info">
          <div className="d-flex align-items-center">
            <i className="bi bi-info-circle me-2"></i>
            <span>No quiz performance data available. Create quizzes and have users take them to see performance analytics.</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {quizData.map((quiz, index) => (
            <div key={quiz.id} className="col-12">
              <div className="quiz-card">
                <div className="quiz-card-header d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="h5 quiz-title mb-1">{quiz.title}</h3>
                    {isAdmin && quiz.creator && (
                      <div className="quiz-meta">
                        <i className="bi bi-person me-1"></i>
                        Created by: {quiz.creator}
                      </div>
                    )}
                    <div className="quiz-meta">
                      <i className="bi bi-question-circle me-1"></i>
                      {quiz.questionsCount} questions
                    </div>
                  </div>
                  <div className="quiz-stats-container">
                    <div className="quiz-average-score">{quiz.averageScore}%</div>
                    <div className="quiz-stats-label">Average Score</div>
                    <div className="quiz-stats-label">{quiz.totalAttempts} attempts</div>
                  </div>
                </div>
                
                <div className="quiz-card-body">
                  <div className="row g-4">
                    <div className="col-12 col-lg-6">
                      <BarChart 
                        data={Object.entries(quiz.scoreDistribution).map(([range, count]) => ({
                          label: range,
                          value: count
                        }))}
                        title="Score Distribution"
                        xAxisLabel="Score Range"
                        yAxisLabel="Number of Attempts"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizPerformance;