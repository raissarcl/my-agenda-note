import { Pressable, Text } from 'react-native';

import { t } from '../../../../lib/i18n';

type Props = {
  saving: boolean;
  deleting: boolean;
  primaryColor: string;
  onPress: () => void;
};

export function NoteEditorHeaderSave({ saving, deleting, primaryColor, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      disabled={saving || deleting}
      style={({ pressed }) => ({
        opacity: saving || deleting ? 0.45 : pressed ? 0.65 : 1,
        paddingHorizontal: 12,
      })}
    >
      <Text style={{ color: primaryColor, fontSize: 17, fontWeight: '600' }}>
        {saving ? t.saving : t.save}
      </Text>
    </Pressable>
  );
}
