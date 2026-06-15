import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InterviewProvider, useInterviewState, useInterviewDispatch } from '../src/context/InterviewContext';
import PasswordGate from '../src/screens/PasswordGate';

// Mock the API
vi.mock('../src/lib/api', () => ({
  verifyPassword: vi.fn(),
}));

import { verifyPassword } from '../src/lib/api';

function renderWithContext() {
  return render(
    <InterviewProvider>
      <PasswordGate />
    </InterviewProvider>
  );
}

describe('PasswordGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the brand mark and title', () => {
    renderWithContext();
    expect(screen.getByText((content, element) => content.includes('Psychological') && element.tagName === 'H1')).toBeInTheDocument();
    expect(screen.getByLabelText('Access code')).toBeInTheDocument();
  });

  it('shows error on empty submit', async () => {
    const user = userEvent.setup();
    renderWithContext();
    const button = screen.getByRole('button', { name: /continue/i });
    await user.click(button);
    expect(screen.getByText('Please enter the access code.')).toBeInTheDocument();
  });

  it('shows error on wrong password', async () => {
    verifyPassword.mockResolvedValue({ valid: false });
    const user = userEvent.setup();
    renderWithContext();
    const input = screen.getByLabelText('Access code');
    const button = screen.getByRole('button', { name: /continue/i });
    await user.type(input, 'wrong');
    await user.click(button);
    expect(await screen.findByText('Incorrect code. Please try again.')).toBeInTheDocument();
  });

  it('shows network error on API failure', async () => {
    verifyPassword.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    renderWithContext();
    const input = screen.getByLabelText('Access code');
    const button = screen.getByRole('button', { name: /continue/i });
    await user.type(input, 'test');
    await user.click(button);
    expect(await screen.findByText('Cannot reach server. Check your connection.')).toBeInTheDocument();
  });
});
