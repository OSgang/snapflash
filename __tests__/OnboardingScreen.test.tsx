import { fireEvent, render, screen } from '@testing-library/react-native';

import OnboardingScreen from '@/screens/OnboardingScreen';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe('OnboardingScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('renders the first onboarding slide', () => {
    render(<OnboardingScreen />);

    expect(screen.getByText('Create Flashcards Instantly')).toBeTruthy();
    expect(
      screen.getByText(
        'Just scan a word that you wish to learn, SnapFlash will automatically create a flashcard for you.'
      )
    ).toBeTruthy();
    expect(screen.getByText('Next')).toBeTruthy();
  });

  it('moves to the second slide when Next is pressed', () => {
    render(<OnboardingScreen />);

    fireEvent.press(screen.getByLabelText('Next onboarding slide'));

    expect(screen.getByText('Study Smart')).toBeTruthy();
    expect(
      screen.getByText('Optimize your learning with spaced repetition in SnapFlash.')
    ).toBeTruthy();
  });

  it('moves through all slides and shows Get Started on the final slide', () => {
    render(<OnboardingScreen />);

    fireEvent.press(screen.getByLabelText('Next onboarding slide'));
    fireEvent.press(screen.getByLabelText('Next onboarding slide'));

    expect(screen.getByText('Stay On Track')).toBeTruthy();
    expect(screen.getByText('Get Started')).toBeTruthy();
    expect(screen.getByLabelText('Onboarding slide 3 of 3')).toBeTruthy();
  });

  it('navigates to Home after the final onboarding action', () => {
    render(<OnboardingScreen />);

    fireEvent.press(screen.getByLabelText('Next onboarding slide'));
    fireEvent.press(screen.getByLabelText('Next onboarding slide'));
    fireEvent.press(screen.getByLabelText('Get started'));

    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('does not crash during render', () => {
    expect(() => render(<OnboardingScreen />)).not.toThrow();
  });
});
