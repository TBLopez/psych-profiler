export default function StatusMessage({ type, children }) {
  if (!children) return null;

  const classes = type === 'error'
    ? 'bg-danger/5 border border-danger/20 text-danger'
    : 'bg-success/5 border border-success/20 text-success';

  return (
    <div className={`text-xs mt-2.5 px-3 py-2 rounded-lg ${classes}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
