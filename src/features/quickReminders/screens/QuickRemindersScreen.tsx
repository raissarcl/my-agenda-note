import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, {
  ScaleDecorator,
  type RenderItemParams,
} from 'react-native-draggable-flatlist';

import { useTheme } from '../../../theme';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { t } from '../../../lib/i18n';
import {
  loadQuickReminders,
  saveAllQuickReminders,
  type QuickReminder,
} from '../../../lib/quickReminders';
import { createQuickRemindersScreenStyles } from '../styles/quickRemindersScreen.styles';

export function QuickRemindersScreen() {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createQuickRemindersScreenStyles);
  const [draft, setDraft] = useState('');
  const [items, setItems] = useState<QuickReminder[]>([]);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);

  const reloadFromStorage = useCallback(async () => {
    try {
      const loaded = await loadQuickReminders();
      setItems(loaded);
    } catch {}
  }, []);

  useEffect(() => {
    void reloadFromStorage();
  }, [reloadFromStorage]);

  useFocusEffect(
    useCallback(() => {
      void reloadFromStorage();
    }, [reloadFromStorage])
  );

  const persistItems = useCallback(async (next: QuickReminder[]) => {
    await saveAllQuickReminders(next);
  }, []);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    const newItem: QuickReminder = {
      id: `quick_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text,
      done: false,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => {
      const next = [newItem, ...prev];
      void persistItems(next);
      return next;
    });
    setDraft('');
  };

  const toggle = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.map((item) =>
          item.id === id ? { ...item, done: !item.done } : item
        );
        void persistItems(next);
        return next;
      });
    },
    [persistItems]
  );

  const remove = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((item) => item.id !== id);
        void persistItems(next);
        return next;
      });
    },
    [persistItems]
  );

  const openEdit = useCallback((item: QuickReminder) => {
    setEditing({ id: item.id, text: item.text });
  }, []);

  const closeEdit = () => setEditing(null);

  const saveEdit = () => {
    if (!editing) return;
    const text = editing.text.trim();
    if (!text) {
      closeEdit();
      return;
    }
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === editing.id ? { ...item, text } : item
      );
      void persistItems(next);
      return next;
    });
    closeEdit();
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      <Text style={[styles.hint, { color: tokens.textMuted }]}>
        {t.quickRemindersTabHint}
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={t.quickRemindersPlaceholder}
          placeholderTextColor={tokens.textFaint}
          onSubmitEditing={add}
          returnKeyType="done"
          style={styles.input}
        />
        <Pressable
          onPress={add}
          style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Ionicons name="add" size={22} color={tokens.primaryText} />
        </Pressable>
      </View>
    </View>
  );

  const renderItem = ({ item, drag, isActive }: RenderItemParams<QuickReminder>) => (
    <ScaleDecorator>
      <View style={[styles.row, { opacity: isActive ? 0.95 : 1 }]}>
        <Pressable
          onLongPress={drag}
          disabled={isActive}
          accessibilityRole="button"
          accessibilityLabel={t.quickRemindersReorderA11y}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          style={({ pressed }) => [
            styles.reorderHit,
            { opacity: pressed || isActive ? 0.65 : 1 },
          ]}
        >
          <Ionicons name="reorder-two-outline" size={22} color={tokens.textMuted} />
        </Pressable>
        <View style={styles.rowMain}>
          <Pressable
            onPress={() => toggle(item.id)}
            onLongPress={() => openEdit(item)}
            delayLongPress={450}
            style={styles.toggle}
          >
            <Ionicons
              name={item.done ? 'checkbox' : 'square-outline'}
              size={22}
              color={item.done ? tokens.success : tokens.textMuted}
            />
          </Pressable>
          <Pressable
            onLongPress={() => openEdit(item)}
            delayLongPress={450}
            style={styles.rowTextPressable}
          >
            <Text
              style={[
                styles.rowText,
                {
                  color: item.done ? tokens.textMuted : tokens.text,
                  textDecorationLine: item.done ? 'line-through' : 'none',
                },
              ]}
            >
              {item.text}
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => remove(item.id)}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons name="trash-outline" size={18} color={tokens.textMuted} />
        </Pressable>
      </View>
    </ScaleDecorator>
  );

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onDragEnd={({ data }) => {
          setItems(data);
          void persistItems(data);
        }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={<Text style={styles.empty}>{t.quickRemindersEmpty}</Text>}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
        containerStyle={styles.listFlex}
        activationDistance={12}
      />

      <Modal
        visible={editing !== null}
        transparent
        animationType="fade"
        onRequestClose={closeEdit}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.editModalRoot}
        >
          <Pressable style={styles.editOverlay} onPress={closeEdit} />
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>{t.quickRemindersEditTitle}</Text>
            <TextInput
              value={editing?.text ?? ''}
              onChangeText={(text) =>
                setEditing((prev) => (prev ? { ...prev, text } : prev))
              }
              placeholder={t.quickRemindersPlaceholder}
              placeholderTextColor={tokens.textFaint}
              multiline
              autoFocus
              style={styles.editInput}
            />
            <View style={styles.editActions}>
              <Pressable
                onPress={closeEdit}
                style={({ pressed }) => [
                  styles.editBtn,
                  styles.editBtnSecondary,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={styles.editBtnText}>{t.cancel}</Text>
              </Pressable>
              <Pressable
                onPress={saveEdit}
                style={({ pressed }) => [
                  styles.editBtn,
                  styles.editBtnPrimary,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={styles.editBtnTextPrimary}>{t.save}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
