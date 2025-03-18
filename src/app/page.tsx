'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface FeatureCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

const features: FeatureCard[] = [
  {
    title: 'Melodic Units',
    description: 'Progress through structured melodic exercises with increasing difficulty',
    href: '/units',
    icon: '🎵',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Piano & MIDI Player',
    description: 'Play virtual piano and listen to MIDI songs with various instruments',
    href: '/piano',
    icon: '🎹',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    title: 'Ear Training',
    description: 'Practice interval recognition and chord identification',
    href: '/ear-training',
    icon: '👂',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    title: 'MIDI Device Test',
    description: 'Connect and test your MIDI keyboard with visual feedback',
    href: '/midi-test',
    icon: '🎛️',
    color: 'from-blue-500 to-cyan-500'
  },
  // Add more features here as they become available
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <motion.h1 
            className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Music Learning Hub
          </motion.h1>
          <motion.p 
            className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Explore different ways to learn and practice music
          </motion.p>
        </div>

        <motion.div 
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item}>
              <Link href={feature.href}>
                <div className={`relative group rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-r ${feature.color}`}>
                  <div className="px-6 py-8">
                    <div className="text-5xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-white/80">
                      {feature.description}
                    </p>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white">→</span>
                    </div>
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
