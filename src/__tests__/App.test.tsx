import '@testing-library/jest-dom';
import {render} from '@testing-library/react';
import App from '../renderer/Components/App';

it('renders without crashing', () => {
  window.scrollTo = jest.fn();
});

describe('App', () => {
  it('should render', () => {
    expect(render(<App />)).toBeTruthy();
  });
});
