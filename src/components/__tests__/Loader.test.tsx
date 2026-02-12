import { render, screen } from '@testing-library/react';
import { Loader } from '../Loader';

describe('Loader component', () => {
  test('renders inline loader with message', () => {
    render(<Loader message="Loading now" fullScreen={false} />);
    expect(screen.getByText('Loading now', { selector: 'span.message' })).toBeInTheDocument();
  });

  test('renders fullScreen loader with message', () => {
    render(<Loader message="Please wait" fullScreen={true} />);
    expect(screen.getByText('Please wait', { selector: 'p.message' })).toBeInTheDocument();
  });
});
