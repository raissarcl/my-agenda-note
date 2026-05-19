import { Text, View } from 'react-native';

import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { createSettingsSectionStyles } from '../styles/settingsSection.styles';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function SettingsSection({ title, subtitle, children }: Props) {
  const styles = useThemedStyles(createSettingsSectionStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}
