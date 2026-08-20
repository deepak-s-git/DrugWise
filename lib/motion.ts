/**
 * MediLens Motion System
 * Centralized animation tokens for consistent, premium motion.
 * 
 * "Biological Scaling" — organic, fluid easing inspired by
 * natural biological systems rather than mechanical motion.
 */

export const motion = {
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.35,
    slow: 0.5,
    reveal: 0.8,
    page: 0.6,
  },
  easing: {
    /** Primary "Biological Scaling" spring — the signature MediLens easing */
    biological: [0.2, 0.8, 0.2, 1] as const,
    /** Standard smooth ease-out */
    smooth: [0.4, 0, 0.2, 1] as const,
    /** Decelerate (enter) */
    enter: [0, 0, 0.2, 1] as const,
    /** Accelerate (exit) */
    exit: [0.4, 0, 1, 1] as const,
  },
  stagger: {
    fast: 0.04,
    normal: 0.08,
    slow: 0.12,
  },
  spring: {
    gentle: { stiffness: 120, damping: 20 },
    snappy: { stiffness: 300, damping: 30 },
    bouncy: { stiffness: 400, damping: 25 },
  },
} as const;

/** CSS cubic-bezier strings for use in inline styles / Tailwind */
export const easingCSS = {
  biological: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;
