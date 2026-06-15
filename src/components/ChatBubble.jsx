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
  const avatar = isUser ? 'Y' : isSystem ? '●' : 'I';

  const avatarClasses = isUser
    ? 'bg-surface-raised text-ink-secondary border border-border'
    : isSystem
    ? 'bg-amber-50 text-amber-600 border border-amber-200'
    : 'bg-gradient-to-br from-accent-primary/10 to-accent-deep/10 text-accent-primary border border-accent-primary/20';

  const hasProfileSections = !isUser && isProfileDelivery && isProfileSection(content);

  const bodyHtml = isUser ? `<p>${content}</p>` : formatContent(content);

  return (
    <motion.div
      className={`flex gap-2 sm:gap-3 items-start mb-4 sm:mb-5 ${isUser ? 'flex-row-reverse' : ''}`}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold shrink-0 mt-0.5 ${avatarClasses}`}>
        {avatar}
      </div>

      {/* Body */}
      <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
        {/* Label */}
        <div className={`text-[10px] font-semibold mb-1 tracking-wide uppercase ${isUser ? 'text-accent-primary/50' : isSystem ? 'text-amber-500' : 'text-accent-primary'}`}>
          {label}
        </div>

        {/* Content */}
        {isUser ? (
          <div className="px-4 py-2.5 max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%] bg-gradient-to-br from-accent-primary to-accent-deep text-white rounded-2xl rounded-br-sm shadow-[0_2px_8px_rgba(79,70,229,0.15)]">
            <p className="text-[14px] sm:text-[15px] leading-relaxed">{content}</p>
          </div>
        ) : isSystem ? (
          <div className="text-[13px] leading-relaxed text-ink-muted italic px-3 py-1.5 bg-amber-50/50 rounded-lg border border-amber-200/50 max-w-[90%] sm:max-w-[85%] md:max-w-[75%]">
            <span dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          </div>
        ) : hasProfileSections ? (
          <div className="space-y-4 max-w-[95%] sm:max-w-[85%] md:max-w-[80%]">
            {content.split(/(---.*?---)/g).filter(Boolean).map((section, i) => {
              if (section.match(/---.*?---/)) {
                const sectionName = section.replace(/---/g, '').trim();
                return (
                  <div key={i} className="bg-white/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-sm">
                    <div className="text-[11px] font-semibold text-accent-primary uppercase tracking-wide mb-2">
                      {sectionName}
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="text-[14px] sm:text-[15px] leading-relaxed text-ink-secondary bg-white/90 backdrop-blur-sm border border-border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm"
                  dangerouslySetInnerHTML={{ __html: formatContent(section) }}
                />
              );
            })}
          </div>
        ) : (
          <div
            className="text-[14px] sm:text-[15px] leading-relaxed text-ink-secondary bg-white/90 backdrop-blur-sm border border-border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm max-w-[90%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[70%]"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        )}
      </div>
    </motion.div>
  );
}
