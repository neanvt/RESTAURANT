/**
 * Animation Utilities
 * Reusable animation configurations for consistent UI motion
 */

export const animations = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },

  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3 },
  },

  // Slide animations
  slideInLeft: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
    transition: { duration: 0.3 },
  },

  slideInRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
    transition: { duration: 0.3 },
  },

  // Scale animations
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { duration: 0.2 },
  },

  // Modal/Dialog animations
  modalBackdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  modalContent: {
    initial: { scale: 0.95, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.95, opacity: 0, y: 20 },
    transition: { duration: 0.3 },
  },

  // List item stagger
  listContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },

  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 },
  },

  // Button interactions
  buttonTap: {
    whileTap: { scale: 0.95 },
    transition: { duration: 0.1 },
  },

  buttonHover: {
    whileHover: { scale: 1.02 },
    transition: { duration: 0.2 },
  },
};

// CSS transition classes
export const transitionClasses = {
  base: "transition-all duration-200 ease-in-out",
  fast: "transition-all duration-150 ease-in-out",
  slow: "transition-all duration-300 ease-in-out",
  colors: "transition-colors duration-200 ease-in-out",
  transform: "transition-transform duration-200 ease-in-out",
  opacity: "transition-opacity duration-200 ease-in-out",
};

// Spring animations for smooth feel
export const springConfig = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const smoothSpring = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};

// Touch feedback animations
export const touchFeedback = {
  initial: { scale: 1 },
  whileTap: { scale: 0.97 },
  transition: { duration: 0.1 },
};

// Loading spinner animation
export const spinnerAnimation = {
  animate: {
    rotate: 360,
  },
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: "linear",
  },
};

// Shimmer effect for skeleton loaders
export const shimmerAnimation = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "linear",
  },
};

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3 },
};

// Card hover effects
export const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" },
  transition: { duration: 0.2 },
};
