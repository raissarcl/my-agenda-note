import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { pressOpacity } from '../../../ui/pressable';
import { t } from '../../../lib/i18n';
import { getNotebook, persistNotebook, type Notebook } from '../../../lib/notes';
import { createNotebookFormStyles } from '../styles/notebookForm.styles';

function newNotebookId(): string {
  return `nb_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function parseId(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

export function NotebookFormScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createNotebookFormStyles);
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const idParam = parseId(params.id);
  const isEdit = typeof idParam === 'string' && idParam.length > 0;

  const [loading, setLoading] = useState(isEdit);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const notebookIdRef = useRef(idParam ?? newNotebookId());

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? t.editNotebook : t.newNotebook });
  }, [navigation, isEdit]);

  useEffect(() => {
    if (!isEdit || !idParam) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void getNotebook(idParam).then((nb) => {
      if (cancelled) return;
      if (nb) setTitle(nb.title);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isEdit, idParam]);

  const onSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      Alert.alert(t.validationTitle);
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const existing = isEdit && idParam ? await getNotebook(idParam) : null;
      const notebook: Notebook = {
        id: notebookIdRef.current,
        title: trimmed,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      await persistNotebook(notebook);
      router.back();
    } catch (e) {
      Alert.alert('Erro', String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      <Text style={styles.label}>{t.notebookTitlePlaceholder}</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={t.notebookTitlePlaceholder}
        editable={!saving}
        autoFocus
        style={styles.input}
      />
      <Pressable
        onPress={() => void onSave()}
        disabled={saving}
        style={({ pressed }) => [
          styles.saveBtn,
          { opacity: pressOpacity(saving, pressed) },
        ]}
      >
        <Text style={styles.saveBtnLabel}>{saving ? t.saving : t.save}</Text>
      </Pressable>
    </View>
  );
}
