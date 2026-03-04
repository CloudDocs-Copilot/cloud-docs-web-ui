import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PreferencesSection } from '../PreferencesSection';

describe('PreferencesSection', () => {
  const defaultPreferences = {
    emailNotifications: true,
    documentUpdates: true,
    aiAnalysis: true,
  };

  it('renders all preference toggles', () => {
    render(<PreferencesSection preferences={defaultPreferences} />);
    expect(screen.getByText('Preferencias')).toBeInTheDocument();
    expect(screen.getByText('Notificaciones por email')).toBeInTheDocument();
    expect(screen.getByText('Actualizaciones de documentos')).toBeInTheDocument();
    expect(screen.getByText('Análisis con IA automático')).toBeInTheDocument();
  });

  it('renders with default values when no preferences provided', () => {
    render(<PreferencesSection />);
    const switches = screen.getAllByRole('checkbox');
    expect(switches).toHaveLength(3);
    switches.forEach((s) => expect(s).toBeChecked());
  });

  it('reflects preferences state correctly', () => {
    render(
      <PreferencesSection
        preferences={{
          emailNotifications: false,
          documentUpdates: true,
          aiAnalysis: false,
        }}
      />
    );

    expect(screen.getByLabelText('Notificaciones por email')).not.toBeChecked();
    expect(screen.getByLabelText('Actualizaciones de documentos')).toBeChecked();
    expect(screen.getByLabelText('Análisis con IA automático')).not.toBeChecked();
  });

  it('calls onPreferenceChange when toggle is clicked', () => {
    const onPreferenceChange = jest.fn();
    render(
      <PreferencesSection
        preferences={defaultPreferences}
        onPreferenceChange={onPreferenceChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Notificaciones por email'));
    expect(onPreferenceChange).toHaveBeenCalledWith('emailNotifications', false);

    fireEvent.click(screen.getByLabelText('Actualizaciones de documentos'));
    expect(onPreferenceChange).toHaveBeenCalledWith('documentUpdates', false);

    fireEvent.click(screen.getByLabelText('Análisis con IA automático'));
    expect(onPreferenceChange).toHaveBeenCalledWith('aiAnalysis', false);
  });
});
