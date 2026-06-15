import { motion, useReducedMotion } from 'framer-motion';
import { formatContent } from '../lib/formatContent';

const spring = { type: 'spring', stiffness: 100, damping: 15 };

function isProfileSection(content) {
  return content.includes('---') && (
    content.includes('EXECUTIVE SUMMARY') ||
    content.includes('PERSONALITY ARCHITECTURE') ||
    content.includes('DEFENSE STRUCTURE') ||
    content.includes('ATTACHMENT') ||
    content.includes('STRESS') ||
    content.includes('SHADOW') ||
    content.includes('RISK') ||
    content.includes('RECOMMENDATIONS')
  );
}

export default function ChatBubble({ role, content, isProfileDelivery }) {
  const reduced = useReducedMotion();
  const isUser = role === 'user';
  const isSystem = role === 'system';
  const label = isUser ? 'You' : isSystem ? 'System' : 'Interviewer';

  const hasProfileSections = !isUser && isProfileDelivery && isProfileSection(content);
  const bodyHtml = isUser ? `<p>${content}</p>` : formatContent(content);

  return (
    <motion.div
      className={`flex gap-2 items-start mb-3 ${isUser ? 'flex-row-reverse' : ''}`}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      {/* Body */}
      <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
        {/* Label — only show for non-user on first message, or always subtle */}
        <div className={`text-[10px] font-medium mb-0.5 px-0.5 ${isUser ? 'text-accent-primary/40 text-right' : isSystem ? 'text-amber-500' : 'text-ink-muted'}`}>
          {label}
        </div>

        {/* Content */}
        {isUser ? (
          <div className="px-3.5 py-2 max-w-[85%] bg-accent-primary text-white rounded-2xl rounded-br-md">
            <p className="text-[15px] leading-relaxed">{content}</p>
          </div>
        ) : isSystem ? (
          <div className="text-[13px] leading-relaxed text-ink-muted italic px-3 py-1.5 max-w-[90%]">
            <span dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          </div>
        ) : hasProfileSections ? (
          <div className="space-y-3 max-w-[95%]">
            {content.split(/(---.*?---)/g).filter(Boolean).map((section, i) => {
              if (section.match(/---.*?---/)) {
                const sectionName = section.replace(/---/g, '').trim();
                return (
                  <div key={i} className="px-3 py-2">
                    <div className="text-[11px] font-semibold text-accent-primary uppercase tracking-wide mb-1">
                      {sectionName}
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="text-[15px] leading-relaxed text-ink-secondary px-1"
                  dangerouslySetInnerHTML={{ __html: formatContent(section) }}
                />
              );
            })}
          </div>
        ) : (
          <div
            className="text-[15px] leading-relaxed text-ink-secondary px-1 max-w-[95%]"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        )}
      </div>
    </motion.div>
  );
}
