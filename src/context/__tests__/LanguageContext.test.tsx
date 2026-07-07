import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../LanguageContext';

// A simple test component to consume the context
const TestComponent = () => {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <span data-testid="translated-text">{t('nav.home')}</span>
      <button onClick={() => setLanguage('hi')}>Switch to Hindi</button>
      <button onClick={() => setLanguage('en')}>Switch to English</button>
    </div>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  it('provides default english language and translation', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
    expect(screen.getByTestId('translated-text')).toHaveTextContent('Home');
  });

  it('can switch to Hindi and update translations', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    act(() => {
      screen.getByText('Switch to Hindi').click();
    });

    expect(screen.getByTestId('current-lang')).toHaveTextContent('hi');
    expect(screen.getByTestId('translated-text')).toHaveTextContent('होम');
  });

  it('falls back to key if translation is missing', () => {
    const FallbackComponent = () => {
      const { t } = useLanguage();
      return <span data-testid="fallback">{t('missing.key.xyz')}</span>;
    };

    render(
      <LanguageProvider>
        <FallbackComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('fallback')).toHaveTextContent('missing.key.xyz');
  });
});
