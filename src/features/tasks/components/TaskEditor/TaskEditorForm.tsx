import { Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { t } from '../../../../lib/i18n';
import { AllDayToggle } from './AllDayToggle';
import { DateTimeFields } from './DateTimeFields';
import { NotificationFields } from './NotificationFields';
import { RecurrenceFields } from './RecurrenceFields';
import { TaskTagField } from './TaskTagField';
import { TaskEditorField as Field } from './TaskEditorField';
import { taskEditorStyles as styles } from './taskEditor.styles';
import type { TaskEditorState } from './useTaskEditorState';

type Props = {
  state: TaskEditorState;
};

export function TaskEditorForm({ state }: Props) {
  const {
    mode,
    existing,
    tokens,
    busy,
    switchColors,
    title,
    setTitle,
    description,
    setDescription,
    allDay,
    done,
    setDone,
    validation,
    isPastSelection,
  } = state;

  return (
    <>
      <Field label={t.title} tokens={tokens}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          editable={!busy}
          placeholder={t.titlePlaceholder}
          placeholderTextColor={tokens.textFaint}
          style={[
            styles.input,
            { color: tokens.text, borderColor: tokens.border, opacity: busy ? 0.65 : 1 },
          ]}
          autoFocus={mode.kind === 'new'}
          returnKeyType="done"
        />
      </Field>

      <Field label={t.description} tokens={tokens}>
        <TextInput
          value={description}
          onChangeText={setDescription}
          editable={!busy}
          placeholder={t.descriptionPlaceholder}
          placeholderTextColor={tokens.textFaint}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={[
            styles.input,
            styles.descriptionInput,
            { color: tokens.text, borderColor: tokens.border, opacity: busy ? 0.65 : 1 },
          ]}
        />
      </Field>

      <TaskTagField state={state} />
      <AllDayToggle state={state} />
      <DateTimeFields state={state} />
      <RecurrenceFields state={state} />
      {!allDay ? <NotificationFields state={state} /> : null}

      {mode.kind === 'edit' ? (
        <Field label={t.done} tokens={tokens}>
          <View style={styles.rowEnd}>
            <Switch
              value={done}
              disabled={busy}
              trackColor={switchColors.trackColor}
              thumbColor={done ? switchColors.thumbOn : switchColors.thumbOff}
              ios_backgroundColor={switchColors.trackColor.false}
              onValueChange={setDone}
            />
          </View>
        </Field>
      ) : null}

      {validation ? (
        <Text style={[styles.validation, { color: tokens.danger }]}>{validation}</Text>
      ) : null}
      {!validation && isPastSelection ? (
        <View
          style={[
            styles.warningBox,
            { borderColor: tokens.border, backgroundColor: tokens.surfaceAlt },
          ]}
        >
          <Ionicons name="warning-outline" size={16} color={tokens.danger} />
          <Text style={[styles.warningText, { color: tokens.textMuted }]}>
            {t.validationPastInline}
          </Text>
        </View>
      ) : null}
      {mode.kind === 'edit' && existing?.recurrence !== 'none' ? (
        <View
          style={[
            styles.warningBox,
            { borderColor: tokens.border, backgroundColor: tokens.surfaceAlt },
          ]}
        >
          <Ionicons name="information-circle-outline" size={16} color={tokens.textMuted} />
          <Text style={[styles.warningText, { color: tokens.textMuted }]}>
            {t.recurrenceSeriesWarning}
          </Text>
        </View>
      ) : null}
    </>
  );
}
