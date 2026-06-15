export function detectPhase(text) {
  if (!text) return null;
  if (text.includes('EXECUTIVE SUMMARY') || text.includes('PSYCHOLOGICAL PROFILE')) {
    return 5;
  }
  if (text.includes('Shadow') && (text.includes('blind spot') || text.includes('hidden'))) {
    return 4;
  }
  if (text.includes('attachment') || text.includes('relational') || text.includes('conflict')) {
    return 3;
  }
  if (text.includes('cognitive') || text.includes('emotional regulation') || text.includes('decision-making')) {
    return 2;
  }
  if (text.includes('baseline') || text.includes('rapport') || text.includes('who you are')) {
    return 1;
  }
  return null;
}
