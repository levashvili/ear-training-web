'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface UnitCompletionModalProps {
  show: boolean;
  score: number;
  stars: number;
  onRetry: () => void;
}

const UnitCompletionModal = ({ 
  show, 
  score, 
  stars,
  onRetry 
}: UnitCompletionModalProps) => {
  if (!show) return null;

  const getMessage = (stars: number) => {
    switch (stars) {
      case 3:
        return "Perfect! You've mastered this unit!";
      case 2:
        return "Great job! Almost perfect!";
      case 1:
        return "Good work! Keep practicing to improve!";
      default:
        return "Keep practicing to earn stars!";
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-center mb-4">Unit Complete!</h2>
        <p className="text-lg text-center mb-6">Final Score: {score}</p>
        
        <div className="flex justify-center gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={`text-4xl transition-colors ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                opacity: i < stars ? 1 : 0.5 
              }}
              transition={{ 
                delay: i < stars ? 0.3 + i * 0.2 : 0,  // Only delay animation for earned stars
                duration: 0.5, 
                type: 'spring' 
              }}
            >
              ⭐
            </motion.div>
          ))}
        </div>

        <p className="text-center text-gray-600 mb-8">
          {getMessage(stars)}
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/units"
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Back to Units
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UnitCompletionModal; 