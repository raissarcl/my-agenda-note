import { Text, View } from 'react-native';

import { taskEditorStyles as styles } from './taskEditor.styles';

type Props = {
  label: string;
  children: React.ReactNode;
  tokens: { text: string; textMuted: string };
};

export function TaskEditorField({ label, children, tokens }: Props) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: tokens.textMuted }]}>{label}</Text>
      {children}
    </View>
  );
}
