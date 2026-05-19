import { View } from 'react-native';

import { HeaderTextButton } from '../../../ui/HeaderTextButton';
import { SettingsHeaderButton } from '../../../ui/SettingsHeaderButton';
import { t } from '../../../lib/i18n';
import { notesListHeaderStyles as styles } from '../styles/notesListHeader.styles';

type SelectProps = {
  mode: 'select';
  busy: boolean;
  selectedCount: number;
  onMove: () => void;
  onCancel: () => void;
  onDeleteMany: () => void;
};

type NormalProps = {
  mode: 'normal';
  busy: boolean;
  onEnterSelect: () => void;
};

type NotebookProps = {
  mode: 'notebook';
  busy: boolean;
  onEnterSelect: () => void;
};

type Props = SelectProps | NormalProps | NotebookProps;

export function NotesListHeader(props: Props) {
  if (props.mode === 'select') {
    const deleteLabel =
      props.selectedCount > 0
        ? `${t.notesDeleteSelected} (${props.selectedCount})`
        : t.notesDeleteSelected;
    return (
      <View style={styles.actions}>
        <HeaderTextButton
          label={t.notesMove}
          disabled={props.selectedCount === 0 || props.busy}
          onPress={props.onMove}
        />
        <HeaderTextButton
          label={t.notesSelectCancel}
          disabled={props.busy}
          onPress={props.onCancel}
        />
        <HeaderTextButton
          label={deleteLabel}
          variant="danger"
          disabled={props.selectedCount === 0 || props.busy}
          onPress={props.onDeleteMany}
        />
      </View>
    );
  }

  if (props.mode === 'notebook') {
    return (
      <View style={styles.actions}>
        <HeaderTextButton
          label={t.notesSelect}
          disabled={props.busy}
          onPress={props.onEnterSelect}
        />
      </View>
    );
  }

  return (
    <View style={styles.actions}>
      <HeaderTextButton
        label={t.notesSelect}
        disabled={props.busy}
        onPress={props.onEnterSelect}
      />
      <SettingsHeaderButton disabled={props.busy} />
    </View>
  );
}
