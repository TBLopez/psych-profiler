import { describe, it, expect } from 'vitest';
import { formatContent, splitParagraphs } from '../src/lib/formatContent';

describe('formatContent', () => {
  it('converts plain text to paragraphs', () => {
    const result = formatContent('Hello world');
    expect(result).toContain('<p>Hello world</p>');
  });

  it('converts double newlines to paragraph breaks', () => {
    const result = formatContent('First paragraph\n\nSecond paragraph');
    expect(result.match(/<p>/g)).toHaveLength(2);
  });

  it('converts **bold** to <strong>', () => {
    const result = formatContent('This is **bold** text');
    expect(result).toContain('<strong>bold</strong>');
  });

  it('converts *italic* to <em>', () => {
    const result = formatContent('This is *italic* text');
    expect(result).toContain('<em>italic</em>');
  });

  it('converts inline `code` to <code>', () => {
    const result = formatContent('Use the `foo()` function');
    expect(result).toContain('<code>foo()</code>');
  });

  it('handles empty string', () => {
    expect(formatContent('')).toBe('');
  });

  it('handles special characters safely', () => {
    const result = formatContent('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });
});

describe('splitParagraphs', () => {
  it('splits html into paragraph blocks', () => {
    const html = '<p>First</p><p>Second</p>';
    const result = splitParagraphs(html);
    expect(result).toHaveLength(2);
  });

  it('returns original html as single block if no <p> tags', () => {
    const html = '<strong>No paragraphs</strong>';
    const result = splitParagraphs(html);
    expect(result).toEqual([html]);
  });
});
