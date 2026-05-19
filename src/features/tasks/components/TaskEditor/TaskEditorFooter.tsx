import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { t } from '../../../../lib/i18n';
import { taskEditorStyles as styles } from './taskEditor.styles';
import type { TaskEditorState } from './useTaskEditorState';

type Props = { state: TaskEditorState };

export function TaskEditorFooter({ state }: Props) {
  const {
    mode,
    tokens,
    insets,
    busy,
    saveInFlight,
    validation,
    onSave,
    onDelete,
    onDuplicate,
    onClear,
    onClose,
  } = state;

  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor: tokens.bg,
          borderTopColor: tokens.border,
          paddingBottom: 12 + insets.bottom,
        },
      ]}
    >
      {mode.kind === 'edit' ? (
        <>
          <Pressable
            onPress={onDelete}
            disabled={busy}
            style={({ pressed }) => [
              styles.footerBtn,
              {
                borderColor: tokens.danger,
                opacity: busy ? 0.45 : pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color={tokens.danger} />
            <Text style={[styles.footerBtnText, { color: tokens.danger }]}>{t.delete}</Text>
          </Pressable>
          <Pressable
            onPress={onDuplicate}
            disabled={busy}
            style={({ pressed }) => [
              styles.footerBtn,
              {
                borderColor: tokens.border,
                opacity: busy ? 0.45 : pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons name="copy-outline" size={18} color={tokens.text} />
            <Text style={[styles.footerBtnText, { color: tokens.text }]}>{t.duplicate}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable
            onPress={onClose}
            disabled={busy}
            style={({ pressed }) => [
              styles.footerBtn,
              {
                borderColor: tokens.border,
                opacity: busy ? 0.45 : pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.footerBtnText, { color: tokens.text }]}>{t.cancel}</Text>
          </Pressable>
          <Pressable
            onPress={onClear}
            disabled={busy}
            style={({ pressed }) => [
              styles.footerBtn,
              {
                borderColor: tokens.border,
                opacity: busy ? 0.45 : pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.footerBtnText, { color: tokens.text }]}>{t.clear}</Text>
          </Pressable>
        </>
      )}
      <Pressable
        onPress={onSave}
        disabled={!!validation || busy}
        style={({ pressed }) => [
          styles.footerBtn,
          styles.footerPrimary,
          {
            backgroundColor: validation ? tokens.surfaceAlt : tokens.primary,
            opacity: busy ? 0.85 : pressed ? 0.85 : 1,
          },
        ]}
      >
        <Ionicons
          name="checkmark"
          size={18}
          color={validation ? tokens.textMuted : tokens.primaryText}
        />
        <Text
          style={[
            styles.footerBtnText,
            { color: validation ? tokens.textMuted : tokens.primaryText },
          ]}
        >
          {saveInFlight ? t.saving : t.save}
        </Text>
      </Pressable>
    </View>
  );
}
