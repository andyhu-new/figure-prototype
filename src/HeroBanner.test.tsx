import { render, screen, fireEvent, act } from '@testing-library/react';
import HeroBanner from './HeroBanner';

jest.useFakeTimers();

describe('HeroBanner Component', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  test('renders initial image', () => {
    render(<HeroBanner />);
    const image = screen.getByAltText('Cat Banner');
    expect(image).toBeInTheDocument();
    expect(image.getAttribute('src')).toBe('https://placecats.com/800/300');
  });

  test('changes to next slide when right button is clicked', () => {
    render(<HeroBanner />);
    const nextButton = screen.getByText('›');
    fireEvent.click(nextButton);
    const image = screen.getByAltText('Cat Banner');
    expect(image.getAttribute('src')).toBe('https://placecats.com/801/300');
  });

  test('changes to previous slide when left button is clicked', () => {
    render(<HeroBanner />);
    const prevButton = screen.getByText('‹');
    fireEvent.click(prevButton);
    const image = screen.getByAltText('Cat Banner');
    expect(image.getAttribute('src')).toBe('https://placecats.com/802/300');
  });

  test('auto-rotates slides', () => {
    render(<HeroBanner />);
    const image = screen.getByAltText('Cat Banner');
    expect(image.getAttribute('src')).toBe('https://placecats.com/800/300');

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(image.getAttribute('src')).toBe('https://placecats.com/801/300');
  });

  test('pauses auto-rotation on mouse enter', () => {
    render(<HeroBanner />);
    const container = screen.getByAltText('Cat Banner').parentElement;
    const image = screen.getByAltText('Cat Banner');
    
    expect(container).not.toBeNull();
    if (container) {
      fireEvent.mouseEnter(container);
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      expect(image.getAttribute('src')).toBe('https://placecats.com/800/300');
    }
  });

  test('resumes auto-rotation on mouse leave', () => {
    render(<HeroBanner />);
    const container = screen.getByAltText('Cat Banner').parentElement;
    const image = screen.getByAltText('Cat Banner');
    
    expect(container).not.toBeNull();
    if (container) {
      fireEvent.mouseEnter(container);
      fireEvent.mouseLeave(container);
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      expect(image.getAttribute('src')).toBe('https://placecats.com/801/300');
    }
  });
});