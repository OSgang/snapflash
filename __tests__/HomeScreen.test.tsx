import { fireEvent, render, screen } from '@testing-library/react-native';

import HomeScreen from '@/screens/HomeScreen';

describe('HomeScreen', () => {
  it('renders the Home overview content', () => {
    render(<HomeScreen />);

    expect(screen.getByText('SnapFlash')).toBeTruthy();
    expect(screen.getByText('Overview')).toBeTruthy();
    expect(screen.getByText('Studied')).toBeTruthy();
    expect(screen.getByText('Reviewed')).toBeTruthy();
  });

  it('renders the last accessed deck list', () => {
    render(<HomeScreen />);

    expect(screen.getByText('Last Accessed')).toBeTruthy();
    expect(screen.getByText('Houses')).toBeTruthy();
    expect(screen.getByText('Economics')).toBeTruthy();
    expect(screen.getByText('Health')).toBeTruthy();
    expect(screen.getByText('My Words')).toBeTruthy();
  });

  it('opens quick actions when the center button is pressed', () => {
    render(<HomeScreen />);

    fireEvent.press(screen.getByLabelText('Open quick actions'));

    expect(screen.getByLabelText('Scan documents')).toBeTruthy();
    expect(screen.getByLabelText('Create flashcard')).toBeTruthy();
    expect(screen.getByLabelText('Close quick actions').props.accessibilityState).toEqual({
      expanded: true,
    });
  });

  it('updates selected deck when a deck card is pressed', () => {
    render(<HomeScreen />);

    fireEvent.press(screen.getByLabelText('Open Economics deck'));

    expect(screen.getByLabelText('Open Economics deck').props.accessibilityState).toEqual({
      selected: true,
    });
    expect(screen.getByLabelText('Open Houses deck').props.accessibilityState).toEqual({
      selected: false,
    });
  });

  it('does not crash during render', () => {
    expect(() => render(<HomeScreen />)).not.toThrow();
  });
});
