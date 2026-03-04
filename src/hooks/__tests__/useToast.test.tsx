import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastProvider } from '../../context/ToastProvider';
import { useToast } from '../../hooks/useToast';

describe('useToast basic behavior', () => {
  it('throws when used outside provider', () => {
    function Consumer() {
      // this should throw when rendered
      useToast();
      return null;
    }

    expect(() => render(<Consumer />)).toThrow(/useToast must be used within ToastProvider/);
  });

  it('works when wrapped with ToastProvider', async () => {
    const Consumer = () => {
      const { showToast, hideToast } = useToast();
      useEffect(() => {
        showToast({ message: 'hello', variant: 'success', title: 'T' });
        setTimeout(() => hideToast(), 100);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return <div>consumer</div>;
    };

    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>
    );

    expect(await screen.findByText('hello')).toBeInTheDocument();
    expect(await screen.findByText('T')).toBeInTheDocument();
  });
});
