import { useLayoutEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RichText, Toolbar } from '@10play/tentap-editor';

import { ScreenBusyOverlay } from '../../../../ui/ScreenBusyOverlay';
import { t } from '../../../../lib/i18n';
import { NOTE_BODY_PLAIN_MAX } from '../../../../lib/notes';
import { showNoteMovePicker } from '../../actions/noteMovePicker';
import { NoteEditorHeaderSave } from './NoteEditorHeaderSave';
import type { NoteEditorProps } from './types';
import { useNoteEditor } from './useNoteEditor';

export function NoteEditor(props: NoteEditorProps) {
  const navigation = useNavigation();
  const {
    tokens,
    styles,
    insets,
    isEdit,
    editor,
    notebooks,
    notebookId,
    setNotebookId,
    title,
    setTitle,
    plainLen,
    counterColor,
    formLocked,
    editorBodyVisible,
    showEditorMask,
    saving,
    deleting,
    onRichTextLoad,
    confirmDelete,
    save,
  } = useNoteEditor(props);

  const saveRef = useRef(save);
  saveRef.current = save;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <NoteEditorHeaderSave
          saving={saving}
          deleting={deleting}
          primaryColor={tokens.primary}
          onPress={() => void saveRef.current()}
        />
      ),
    });
  }, [navigation, saving, deleting, tokens.primary]);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollFlex}
        scrollEnabled={!formLocked}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <Text style={styles.hint}>{t.notesTabHint}</Text>
        <Pressable
          onPress={() =>
            showNoteMovePicker(notebooks, notebookId, (target) => setNotebookId(target))
          }
          disabled={formLocked}
          style={({ pressed }) => [
            styles.locationRow,
            { opacity: formLocked ? 0.65 : pressed ? 0.92 : 1 },
          ]}
        >
          <Ionicons name="folder-outline" size={18} color={tokens.text} />
          <Text style={styles.locationText}>
            {t.notesLocation}:{' '}
            {notebookId
              ? notebooks.find((n) => n.id === notebookId)?.title.trim() ||
                t.notebookTitlePlaceholder
              : t.notesMoveToMain}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={tokens.textFaint} />
        </Pressable>
        <TextInput
          value={title}
          onChangeText={setTitle}
          editable={!formLocked}
          placeholder={t.notesTitlePlaceholder}
          placeholderTextColor={tokens.textFaint}
          style={[styles.titleInput, { opacity: formLocked ? 0.65 : 1 }]}
        />
        <Text style={[styles.counter, { color: counterColor }]}>
          {t.notesCharLabel}: {plainLen} / {NOTE_BODY_PLAIN_MAX}
        </Text>

        <View style={styles.toolbarRow}>
          <Toolbar editor={editor} hidden={false} />
        </View>

        <View style={styles.editorShell}>
          <RichText editor={editor} style={styles.rich} onLoad={onRichTextLoad} />
          {showEditorMask ? (
            <View
              style={styles.editorLoadingOverlay}
              pointerEvents={saving || deleting ? 'auto' : 'none'}
            >
              {!editorBodyVisible ? (
                <ActivityIndicator color={tokens.primary} />
              ) : null}
            </View>
          ) : null}
        </View>

        {isEdit ? (
          <Pressable
            onPress={confirmDelete}
            disabled={deleting || saving}
            style={({ pressed }) => [
              styles.deleteBtn,
              { opacity: deleting || saving ? 0.45 : pressed ? 0.75 : 1 },
            ]}
          >
            <Text style={{ color: tokens.danger, fontWeight: '600' }}>{t.notesDelete}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <ScreenBusyOverlay visible={saving || deleting} />
    </View>
  );
}
