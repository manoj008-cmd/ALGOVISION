export enum Algorithm {
  QuickSort = 'Quick Sort',
  MergeSort = 'Merge Sort',
  SelectionSort = 'Selection Sort',
  InsertionSort = 'Insertion Sort',
  BinarySearch = 'Binary Search',
  LinearSearch = 'Linear Search',
}

export interface VisualizationStep {
  array: number[];
  highlights: { [key: number]: string }; // index -> color class
  swaps?: [number, number];
  pivot?: number;
  message: string;
  sortedIndices: number[];
  comparisons: number;
  arrayAccesses: number; // Broader term for swaps/reads
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic?: string;
}

export interface QuizAttempt {
  question: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
}

export interface QuizSession {
  timestamp: string;
  score: number;
  total: number;
  duration: number; // in seconds
  attempts: QuizAttempt[];
}

export interface User {
  name: string;
  studentId: string;
  phone: string;
  email: string;
}

export interface VisualizationReportData {
  initialArray: number[];
  sortedArray: number[];
  algorithm: string;
  complexity: string;
  stats: {
    comparisons: number;
    arrayAccesses: number;
  };
  timestamp: string;
}
