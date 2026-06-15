import { motion, useReducedMotion } from 'framer-motion';

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function StaggeredReveal({ html, disabled }) {
  const reduced = useReducedMotion();

  if (reduced || disabled) {
    return <div className="text-[15px] leading-relaxed text-ink-secondary" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // Split on <p> tags for paragraph-level staggering
  const paragraphs = html.split(/(<p>.*?<\/p>)/g).filter(Boolean);

  if (paragraphs.length <= 1) {
    return <div className="text-[15px] leading-relaxed text-ink-secondary" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="text-[15px] leading-relaxed text-ink-secondary">
      {paragraphs.map((p, i) => (
        <motion.span key={i} variants={item} dangerouslySetInnerHTML={{ __html: p }} />
      ))}
    </motion.div>
  );
}
