import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

type Props = {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  bottom?: number;
};

export function Fab({ onPress, icon = 'add', bottom = 24 }: Props) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { bottom: bottom + insets.bottom }]} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: tokens.primary, opacity: pressed ? 0.85 : 1 },
        ]}
        android_ripple={{ color: '#ffffff33', radius: 32 }}
      >
        <Ionicons name={icon} size={28} color={tokens.primaryText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 20,
    alignItems: 'flex-end',
  },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});
