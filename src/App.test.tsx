import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders welcome message', () => {
    render(<App />);
    const headingElement = screen.getByText(/Welcome to the Figure Prototype/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders HeroBanner component', () => {
    const { container } = render(<App />);
    expect(container.querySelector('img')).toBeInTheDocument();
  });
});