'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { units } from '../data/units';
import { useState } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function UnitsPage() {
  const [hoveredUnit, setHoveredUnit] = useState<number | null>(null);

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <svg
            key={i}
            className={`w-6 h-6 ${
              i < count 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300 fill-current'
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <span className="mr-2">←</span>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 ml-8">Select Unit</h1>
        </div>

        {/* Units Grid */}
        <motion.div 
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {units.map((unit) => (
            <motion.div 
              key={unit.id}
              variants={item}
              onHoverStart={() => setHoveredUnit(unit.id)}
              onHoverEnd={() => setHoveredUnit(null)}
            >
              <Link href={unit.isUnlocked ? `/ear-training?unit=${unit.id}` : '#'}>
                <div 
                  className={`
                    relative overflow-hidden rounded-xl shadow-lg 
                    ${unit.isUnlocked 
                      ? 'bg-white hover:shadow-xl transform transition-all duration-300 hover:scale-105' 
                      : 'bg-gray-100 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="px-6 py-8">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {unit.title}
                      </h3>
                      {renderStars(unit.stars)}
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {unit.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="text-gray-700 font-medium">
                          {unit.melodies.length} melodies
                        </span>
                      </div>
                      
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(unit.stars / 3) * 100}%`,
                            opacity: hoveredUnit === unit.id ? 0.8 : 1
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>⭐ {unit.requiredScore.oneStar}</span>
                        <span>⭐⭐ {unit.requiredScore.twoStars}</span>
                        <span>⭐⭐⭐ {unit.requiredScore.threeStars}</span>
                      </div>
                    </div>

                    {!unit.isUnlocked && (
                      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg flex items-center">
                          <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span className="text-gray-900 font-medium">Complete previous unit</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
} 