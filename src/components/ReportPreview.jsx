import { motion } from 'framer-motion';

const SECTIONS = [
  { num: 1, title: 'Executive Summary' },
  { num: 2, title: 'Personality Architecture' },
  { num: 3, title: 'Defense Structure' },
  { num: 4, title: 'Attachment & Relational Profile' },
  { num: 5, title: 'Stress & Coping Profile' },
  { num: 6, title: 'Shadow Integration' },
  { num: 7, title: 'Risk & Resilience Assessment' },
  { num: 8, title: 'Recommendations' },
];

export default function ReportPreview() {
  return (
    <div className="grid grid-cols-2 gap-2.5 w-full">
      {SECTIONS.map((section, i) => (
        <motion.div
          key={section.num}
          className="bg-white border border-border rounded-xl px-3.5 py-3 text-left cursor-default transition-all hover:border-accent-primary/30 hover:shadow-sm hover:-translate-y-0.5"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
        >
          <div className="text-[10px] font-semibold text-accent-primary/60 mb-1">
            {String(section.num).padStart(2, '0')}
          </div>
          <div className="text-xs font-medium text-ink leading-tight">{section.title}</div>
        </motion.div>
      ))}
    </div>
  );
}
