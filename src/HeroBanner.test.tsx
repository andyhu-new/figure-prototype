import React from 'react';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import HeroBanner from './HeroBanner';

describe('HeroBanner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders hero banner with navigation buttons', () => {
    render(<HeroBanner />);
    expect(screen.getByRole('button', { name: '‹' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '›' })).toBeInTheDocument();
  });

  test('displays initial image', () => {
    render(<HeroBanner />);
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      'src',
      expect.stringContaining('placecats.com')
    );
  });

  test('changes image when clicking next button', () => {
    render(<HeroBanner />);
    const initialImage = screen.getByRole('img').getAttribute('src');
    const nextButton = screen.getByRole('button', { name: '›' });

    fireEvent.click(nextButton);

    const newImage = screen.getByRole('img').getAttribute('src');
    expect(newImage).not.toBe(initialImage);
  });

  test('changes image when clicking previous button', () => {
    render(<HeroBanner />);
    const initialImage = screen.getByRole('img').getAttribute('src');
    const prevButton = screen.getByRole('button', { name: '‹' });

    fireEvent.click(prevButton);

    const newImage = screen.getByRole('img').getAttribute('src');
    expect(newImage).not.toBe(initialImage);
  });

  test('auto-rotates images every 5 seconds', () => {
    render(<HeroBanner />);
    const initialImage = screen.getByRole('img').getAttribute('src');

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    const newImage = screen.getByRole('img').getAttribute('src');
    expect(newImage).not.toBe(initialImage);
  });

  test('pauses auto-rotation on hover', () => {
    render(<HeroBanner />);
    const banner = screen.getByRole('img').parentElement;
    const initialImage = screen.getByRole('img').getAttribute('src');

    fireEvent.mouseEnter(banner!);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    const imageAfterHover = screen.getByRole('img').getAttribute('src');
    expect(imageAfterHover).toBe(initialImage);
  });

  test('resumes auto-rotation after hover ends', () => {
    render(<HeroBanner />);
    const banner = screen.getByRole('img').parentElement;
    const initialImage = screen.getByRole('img').getAttribute('src');

    fireEvent.mouseEnter(banner!);
    fireEvent.mouseLeave(banner!);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    const imageAfterHoverEnd = screen.getByRole('img').getAttribute('src');
    expect(imageAfterHoverEnd).not.toBe(initialImage);
  });

  test('handles keyboard arrow keys for horizontal scroll', async () => {
    render(<HeroBanner />);
    const image = screen.getByRole('img');

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    await waitFor(() => {
      expect(image).toHaveStyle('transform: translateX(-50px)');
    });

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    await waitFor(() => {
      expect(image).toHaveStyle('transform: none');
    });
  });
});
