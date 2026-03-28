import { render, screen } from '@testing-library/react';
import App from './App';

test('renders flash sale title', () => {
  render(<App />);

  const title = screen.getByText('🔥 Flash Sale');

  expect(title).toBeInTheDocument();
});