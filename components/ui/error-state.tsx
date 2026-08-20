'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

interface ErrorStateProps {
  code?: 400 | 404 | 429 | 500 | 503 | 504 | 'offline';
  title: string;
  message?: string;
  onRetry?: () => void;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

const ERROR_CONFIG = {
  400: {
    punchline: "Diagnosis: Unreadable",
    color: "text-error",
    bg: "bg-error/10",
  },
  404: {
    punchline: "Diagnosis: Missing in Action",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  429: {
    punchline: "Diagnosis: Overdose of Requests",
    color: "text-tertiary",
    bg: "bg-tertiary/10",
  },
  500: {
    punchline: "Diagnosis: Acute Server Failure",
    color: "text-error",
    bg: "bg-error/10",
  },
  503: {
    punchline: "Diagnosis: Server in Surgery",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  504: {
    punchline: "Diagnosis: Code Blue Timeout",
    color: "text-tertiary",
    bg: "bg-tertiary/10",
  },
  'offline': {
    punchline: "Diagnosis: Flatline Connection",
    color: "text-outline",
    bg: "bg-outline/10",
  },
};

export function ErrorState({
  code = 500,
  title,
  message,
  onRetry,
  actionText = "Return to Dashboard",
  actionHref = "/",
  className = "",
}: ErrorStateProps) {
  const config = ERROR_CONFIG[code];

  return (
    <div className={`flex flex-col items-center justify-center w-full text-center px-4 ${className}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 20,
          duration: 0.5 
        }}
        className="relative w-32 h-32 sm:w-40 sm:h-40 mb-6 ml-4"
      >
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inset-0 rounded-full blur-3xl ${config.bg}`}
        />
        <Image
          src={`/errors/${code}.svg`}
          alt={`Error ${code}`}
          fill
          className="object-contain relative z-10 drop-shadow-lg"
          priority
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex flex-col items-center justify-center w-full"
      >
        <div className="flex justify-center mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-label-md uppercase tracking-wider font-bold border ${config.color} border-current bg-surface-container-lowest shadow-sm whitespace-nowrap`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
            {config.punchline}
          </span>
        </div>

        <h2 className="text-headline-md sm:text-headline-lg text-primary mb-2 text-balance whitespace-nowrap">
          {title}
        </h2>
        
        {message && (
          <p className="text-body-md sm:text-body-lg text-on-surface-variant mb-6 leading-relaxed">
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );
}
