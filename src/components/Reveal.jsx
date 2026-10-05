import { motion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1];

/** Parent of a staggered grid: children of this variant fade up one by one. */
const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.15 } },
};

/** A single card/row inside a StaggerGrid. */
const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

/**
 * Scroll-reveal wrapper for a page block. Reveals once when it enters the
 * viewport; children marked with itemVariants stagger in after it.
 *
 * @param {{children: React.ReactNode, className?: string, id?: string}} props
 * @returns {JSX.Element}
 */
export function Reveal({ children, className, id }) {
  return (
    <motion.div
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.08, margin: '0px 0px -40px 0px' }}
      variants={{
        hidden: { opacity: 0, y: 26 },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Grid container whose direct children stagger in on reveal.
 *
 * @param {{children: React.ReactNode, className?: string, style?: React.CSSProperties}} props
 * @returns {JSX.Element}
 */
export function StaggerGrid({ children, className, style }) {
  return (
    <motion.div className={className} style={style} variants={staggerParent}>
      {children}
    </motion.div>
  );
}

/**
 * Direct child of a StaggerGrid: fades up in sequence.
 *
 * @param {{children: React.ReactNode, className?: string}} props
 * @returns {JSX.Element}
 */
export function RevealItem({ children, className }) {
  return (
    <motion.div className={className ? `stagger-child ${className}` : 'stagger-child'} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
