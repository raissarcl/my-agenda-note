import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import {
  CoreBridge,
  PlaceholderBridge,
  TenTapStartKit,
  darkEditorTheme,
  defaultEditorTheme,
  useEditorBridge,
  useEditorContent,
} from '@10play/tentap-editor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../../../theme';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { t } from '../../../../lib/i18n';
import {
  NOTE_BODY_PLAIN_MAX,
  loadNotebooks,
  type Notebook,
  persistNote,
  removeNote,
} from '../../../../lib/notes';
import { createNoteEditorStyles } from './noteEditor.styles';
import { noteEditorDocumentCss } from './noteEditorDocumentCss';
import type { NoteEditorProps } from './types';

function newNoteId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function useNoteEditor({
  initialNote,
  notebookId: notebookIdProp = null,
  onClose,
  onDeleted,
}: NoteEditorProps) {
  const { tokens, isDark } = useTheme();
  const styles = useThemedStyles(createNoteEditorStyles);
  const insets = useSafeAreaInsets();
  const isEdit = initialNote !== null;
  const noteIdRef = useRef(initialNote?.id ?? newNoteId());

  const [notebookId, setNotebookId] = useState<string | null>(
    initialNote?.notebookId ?? notebookIdProp ?? null
  );
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [title, setTitle] = useState(initialNote?.title ?? '');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void loadNotebooks().then(setNotebooks);
  }, []);

  const initialHtml = initialNote?.bodyHtml?.trim() ? initialNote.bodyHtml : '<p></p>';

  const editorTheme = useMemo(() => {
    const base = isDark ? darkEditorTheme : defaultEditorTheme;
    const tb = base.toolbar ?? defaultEditorTheme.toolbar;
    return {
      ...base,
      webview: { backgroundColor: tokens.surface },
      toolbar: {
        ...tb,
        toolbarBody: {
          ...StyleSheet.flatten(tb.toolbarBody ?? {}),
          flex: 0,
          flexGrow: 0,
          height: 48,
          minHeight: 48,
          backgroundColor: tokens.surface,
          borderTopColor: tokens.border,
          borderBottomColor: tokens.border,
        },
        toolbarButton: {
          ...StyleSheet.flatten(tb.toolbarButton ?? {}),
          backgroundColor: tokens.surface,
        },
        iconWrapper: {
          ...StyleSheet.flatten(tb.iconWrapper ?? {}),
          backgroundColor: tokens.surface,
        },
      },
    };
  }, [isDark, tokens.surface, tokens.border]);

  const noteDocCss = useMemo(
    () => noteEditorDocumentCss(tokens.surface, tokens.text, tokens.textMuted, tokens.primary),
    [tokens.surface, tokens.text, tokens.textMuted, tokens.primary]
  );

  const noteBridgeExtensions = useMemo(
    () => [
      ...TenTapStartKit,
      PlaceholderBridge.configureExtension({ placeholder: t.notesBodyPlaceholder }),
      CoreBridge.configureCSS(noteDocCss),
    ],
    []
  );

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: initialHtml,
    theme: editorTheme,
    bridgeExtensions: noteBridgeExtensions,
  });

  const editorRef = useRef(editor);
  editorRef.current = editor;
  const noteDocCssRef = useRef(noteDocCss);
  noteDocCssRef.current = noteDocCss;

  const [editorBodyVisible, setEditorBodyVisible] = useState(false);
  const webviewLoadedRef = useRef(false);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleEditorReveal = useCallback(() => {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    void editorRef.current.injectCSS(noteDocCssRef.current, CoreBridge.name);
    revealTimerRef.current = setTimeout(() => {
      revealTimerRef.current = null;
      setEditorBodyVisible(true);
    }, 140);
  }, []);

  const onRichTextLoad = useCallback(() => {
    if (webviewLoadedRef.current) return;
    webviewLoadedRef.current = true;
    setEditorBodyVisible(false);
    scheduleEditorReveal();
  }, [scheduleEditorReveal]);

  useEffect(() => {
    if (!webviewLoadedRef.current) return;
    void editorRef.current.injectCSS(noteDocCss, CoreBridge.name);
  }, [noteDocCss]);

  useEffect(
    () => () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    },
    []
  );

  const editorPlain = useEditorContent(editor, { type: 'text', debounceInterval: 200 });
  const plainLen = editorPlain?.length ?? 0;

  const save = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      const rawText = await editor.getText();
      const bodyHtml = await editor.getHTML();
      const titleTrim = title.trim();
      const bodyTrimmed = rawText.trim();

      if (!titleTrim && !bodyTrimmed) {
        Alert.alert(t.notesEmpty);
        return;
      }
      if (rawText.length > NOTE_BODY_PLAIN_MAX) {
        Alert.alert(t.notesBodyTooLong);
        return;
      }

      const now = new Date().toISOString();
      await persistNote({
        id: noteIdRef.current,
        notebookId,
        title: titleTrim,
        bodyHtml,
        createdAt: initialNote?.createdAt ?? now,
        updatedAt: now,
      });
      onClose();
    } catch (e) {
      Alert.alert('Erro', String(e));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [editor, initialNote, notebookId, onClose, title]);

  const confirmDelete = useCallback(() => {
    if (!isEdit || !initialNote) return;
    Alert.alert(t.notesDelete, t.notesDeleteConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setDeleting(true);
            try {
              await removeNote(initialNote.id);
            } catch (e) {
              setDeleting(false);
              Alert.alert('Erro', String(e));
              return;
            }
            setDeleting(false);
            if (onDeleted) onDeleted();
            else onClose();
          })();
        },
      },
    ]);
  }, [initialNote, isEdit, onClose, onDeleted]);

  const formLocked = saving || deleting;
  const showEditorMask = !editorBodyVisible || saving || deleting;
  const counterColor = plainLen > NOTE_BODY_PLAIN_MAX ? tokens.danger : tokens.textMuted;

  return {
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
  };
}
