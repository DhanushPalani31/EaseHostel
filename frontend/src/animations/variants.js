// Reusable Framer Motion variants for consistent animation across the app

export const fadeIn = {
  initial:   { opacity: 0 },
  animate:   { opacity: 1 },
  exit:      { opacity: 0 },
  transition: { duration: 0.2 }
};

export const slideUp = {
  initial:   { opacity: 0, y: 16 },
  animate:   { opacity: 1, y: 0 },
  exit:      { opacity: 0, y: 8 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
};

export const slideDown = {
  initial:   { opacity: 0, y: -12 },
  animate:   { opacity: 1, y: 0 },
  exit:      { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
};

export const scaleIn = {
  initial:   { opacity: 0, scale: 0.96 },
  animate:   { opacity: 1, scale: 1 },
  exit:      { opacity: 0, scale: 0.96 },
  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } }
};

export const staggerItem = {
  initial:   { opacity: 0, y: 12 },
  animate:   { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
};

export const slideInRight = {
  initial:   { opacity: 0, x: 32 },
  animate:   { opacity: 1, x: 0 },
  exit:      { opacity: 0, x: 32 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
};

export const springTransition = { type: 'spring', stiffness: 400, damping: 30 };
