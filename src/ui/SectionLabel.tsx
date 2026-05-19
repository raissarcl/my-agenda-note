import { Text, type StyleProp, type TextStyle } from 'react-native';

import { useThemedStyles } from '../hooks/useThemedStyles';
import { createSectionLabelStyles } from './sectionLabel.styles';

type Props = {
  children: string;
  style?: StyleProp<TextStyle>;
};

export function SectionLabel({ children, style }: Props) {
  const styles = useThemedStyles(createSectionLabelStyles);
  return <Text style={[styles.label, style]}>{children}</Text>;
}
