import { motion, useReducedMotion } from 'framer-motion';
import { formatContent } from '../lib/formatContent';
import StaggeredReveal from './StaggeredReveal';

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
  const isLongMessage = !isUser && !isSystem && content.length > 200;

  const bodyHtml = isUser ? `<p>${content}</p>` : formatContent(content);

  return (
    <motion.div
      className={`msg flex gap-3 items-start mb-6 max-w-full ${isUser ? 'flex-row-reverse' : ''}`}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${avatarClasses}`}>
        {avatar}
      </div>

      {/* Body */}
      <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
        {/* Label */}
        <div className={`text-[11px] font-semibold mb-1.5 tracking-wide uppercase ${isUser ? 'text-accent-primary/60' : isSystem ? 'text-amber-500' : 'text-accent-primary'}`}>
          {label}
        </div>

        {/* Content */}
        {isUser ? (
          <div className="px-4 py-2.5 max-w-[80%] bg-gradient-to-br from-accent-primary to-accent-deep text-white rounded-[16px] rounded-br-[4px] shadow-[0_2px_8px_rgba(79,70,229,0.15)]">
            <p className="text-[15px] leading-relaxed">{content}</p>
          </div>
        ) : hasProfileSections ? (
          <div className="space-y-4">
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
                <div key={i} className="text-[15px] leading-relaxed text-ink-secondary"
                  dangerouslySetInnerHTML={{ __html: formatContent(section) }}
                />
              );
            })}
          </div>
        ) : isLongMessage ? (
          <StaggeredReveal html={bodyHtml} disabled={reduced} />
        ) : (
          <div
            className={`text-[15px] leading-relaxed text-ink-secondary ${isSystem ? 'italic text-ink-muted text-xs' : ''}`}
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        )}
      </div>
    </motion.div>
  );
}
