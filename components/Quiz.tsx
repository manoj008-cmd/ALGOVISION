import React, { useState, useEffect, useCallback } from 'react';
import { QUIZ_QUESTIONS } from '../quizQuestions';
import type { QuizSession, QuizQuestion, QuizAttempt } from '../types';
import { apiService } from '../services/apiService';

const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const persistQuizResult = async (result: QuizSession) => {
  const token = localStorage.getItem('algoToken');
  if (!token) return;

  try {
    const topicSet = new Set<string>();
    result.attempts.forEach((attempt) => {
      const normalized = attempt.question.toLowerCase();
      if (normalized.includes('sort')) topicSet.add('Sorting');
      if (normalized.includes('search')) topicSet.add('Searching');
      if (normalized.includes('binary')) topicSet.add('Binary Search');
      if (normalized.includes('graph')) topicSet.add('Graphs');
      if (normalized.includes('tree')) topicSet.add('Trees');
      if (normalized.includes('stack')) topicSet.add('Stacks');
      if (normalized.includes('queue')) topicSet.add('Queues');
      if (normalized.includes('complexity')) topicSet.add('Complexity Analysis');
    });

    await apiService.submitQuizResult({
      score: result.score,
      totalQuestions: result.total,
      topicsCovered: [...topicSet],
    });
  } catch (error) {
    console.warn('Unable to persist quiz result to backend.', error);
  }
};

const Quiz: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);

  const loadQuestions = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setAttempts([]);
    setQuizStartTime(Date.now());

    try {
      if (QUIZ_QUESTIONS.length < 5) {
        throw new Error('Not enough questions in the bank to start a quiz.');
      }
      const shuffledQuestions = shuffleArray(QUIZ_QUESTIONS);
      setQuestions(shuffledQuestions.slice(0, 5));
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz from the question bank.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    const attempt: QuizAttempt = {
      question: currentQuestion.question,
      options: currentQuestion.options,
      selectedAnswer: option,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation,
      isCorrect,
    };
    setAttempts((prev) => [...prev, attempt]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      return;
    }

    const duration = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : 0;
    const finalAttempts = attempts;
    const finalScore = score + (selectedAnswer === questions[currentQuestionIndex]?.correctAnswer && !attempts.some(
      (attempt, index) => index === currentQuestionIndex && attempt.selectedAnswer === selectedAnswer
    ) ? 1 : 0);

    const result: QuizSession = {
      score: finalScore,
      total: questions.length,
      timestamp: new Date().toISOString(),
      duration,
      attempts: finalAttempts,
    };

    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    history.push(result);
    localStorage.setItem('quizHistory', JSON.stringify(history));

    void persistQuizResult(result);
    setQuizFinished(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
        <h2 className="text-2xl font-bold mb-4 animate-pulse">Loading Quiz...</h2>
        <p className="text-gray-400">Preparing your questions. Please wait a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-400">Oops! Something went wrong.</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={loadQuestions}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
        <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
        <p className="text-xl text-gray-300 mb-6">
          Your Score: <span className="font-bold text-green-400">{score}</span> / <span className="font-bold">{questions.length}</span>
        </p>
        <button
          onClick={loadQuestions}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md"
        >
          Take a New Quiz
        </button>
      </div>
    );
  }

  if (questions.length === 0 || !questions[currentQuestionIndex]) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
        <h2 className="text-2xl font-bold">No questions loaded.</h2>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="mb-4">
        <p className="text-sm text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
        <h2 className="text-2xl font-bold mt-1">{currentQuestion.question}</h2>
      </div>
      <div className="space-y-3">
        {currentQuestion.options.map((option) => {
          const isCorrect = option === currentQuestion.correctAnswer;
          const isSelected = option === selectedAnswer;
          let buttonClass = 'w-full text-left p-4 rounded-md border transition-colors ';
          if (isAnswered) {
            if (isCorrect) {
              buttonClass += 'bg-green-800/50 border-green-600 text-white';
            } else if (isSelected) {
              buttonClass += 'bg-red-800/50 border-red-600 text-white';
            } else {
              buttonClass += 'bg-gray-700 border-gray-600 text-gray-400';
            }
          } else {
            buttonClass += 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/80 hover:border-indigo-500';
          }

          return (
            <button key={option} onClick={() => handleAnswerSelect(option)} disabled={isAnswered} className={buttonClass}>
              {option}
            </button>
          );
        })}
      </div>
      {isAnswered && (
        <div className="mt-6">
          <div className="p-4 bg-gray-700/50 rounded-md">
            <h3 className="font-bold text-lg">{selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}</h3>
            <p className="text-gray-300 mt-2">{currentQuestion.explanation}</p>
          </div>
          <button
            onClick={handleNextQuestion}
            className="w-full mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
