import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ScrollReveal Word component that animates opacity & filter on scroll
 */
function RevealWord({ word, progress, range }) {
  const opacity = useTransform(progress, range, [0.22, 1]);
  const blur = useTransform(progress, range, ['2px', '0px']);
  const color = useTransform(progress, range, ['#8c7e7b', '#f7ede2']);

  return (
    <motion.span
      style={{ opacity, filter: `blur(${blur})`, color }}
      className="inline-block mr-[0.32em] transition-colors duration-200 select-text"
    >
      {word}
    </motion.span>
  );
}

/**
 * ScrollReveal Paragraph/Block
 */
function RevealBlock({ text, containerRef, index, total }) {
  const elementRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: elementRef,
    container: containerRef,
    offset: ['start 90%', 'center 50%'],
  });

  const words = text.split(' ');

  return (
    <p
      ref={elementRef}
      className="my-3 leading-relaxed text-lg font-serif-vintage tracking-wide"
    >
      {words.map((word, wIdx) => {
        const start = wIdx / words.length;
        const end = start + (1 / words.length);
        return (
          <RevealWord
            key={wIdx}
            word={word}
            progress={scrollYProgress}
            range={[Math.max(0, start * 0.9), Math.min(1, end)]}
          />
        );
      })}
    </p>
  );
}

/**
 * ScrollReveal component inspired by ReactBits
 * (https://reactbits.dev/text-animations/scroll-reveal)
 * Reveals words / verses progressively with scroll within a container.
 */
export default function ScrollReveal({
  content = '',
  containerRef,
  className = '',
}) {
  const paragraphs = content
    ? content.split('\n').filter((p) => p.trim() !== '')
    : [];

  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((paragraph, idx) => (
        <RevealBlock
          key={idx}
          text={paragraph}
          containerRef={containerRef}
          index={idx}
          total={paragraphs.length}
        />
      ))}
    </div>
  );
}
