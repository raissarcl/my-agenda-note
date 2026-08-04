import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Alert } from 'react-native';
import { LocaleConfig } from 'react-native-calendars';
import type { Recurrence } from '../types';

export function configureLocale() {
  LocaleConfig.locales['pt-BR'] = {
    monthNames: [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
    monthNamesShort: [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ],
    dayNames: [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    today: 'Hoje',
  };
  LocaleConfig.defaultLocale = 'pt-BR';
}

export const t = {
  appName: 'MyAgenda',
    tabCombined: 'Calendário',
  tabCalendar: 'Calendário',
  holidayFacultative: 'Ponto facultativo',
  tabList: 'Lista',
  tabQuickReminders: 'Lembretes',
  tabNotes: 'Notas',
  today: 'Hoje',
  newTask: 'Nova tarefa',
  editTask: 'Editar tarefa',
  title: 'Título',
  titlePlaceholder: 'O que vai acontecer?',
  description: 'Descrição',
  descriptionPlaceholder: 'Detalhes (opcional)',
  date: 'Data',
  time: 'Hora',
  allDay: 'Dia inteiro',
  allDayRecurrenceHint:
    'A repetição aplica-se a dias inteiros. Lembretes por hora ficam desligados em dia inteiro.',
  recurrence: 'Repetir',
  recurrenceEnd: 'Repetir até',
  recurrenceEndHint:
    'Obrigatório para repetições. No máximo 1 ano após a data inicial — depois pode criar outro compromisso.',
  recurrenceEndPick: 'Escolher data final',
  notification: 'Notificação',
  recurrenceNone: 'Não repetir',
  recurrenceDaily: 'Diariamente',
  recurrenceWeekdays: 'Dias úteis (seg–sex)',
  recurrenceWeekly: 'Semanalmente',
  recurrenceMonthly: 'Mensalmente',
  recurrenceCustom: 'Dias da semana (personalizado)',
  recurrenceCustomWeekdays: 'Quais dias repetir',
  customWeekdaysHint:
    'Toque nos dias da semana em que o compromisso deve ocorrer. Use “Repetir até” para limitar o período.',
  validationCustomWeekdays: 'Escolha pelo menos um dia da semana.',
  notificationsPaused: 'Pausar notificações',
  notificationsPausedHint:
    'Enquanto pausado, este compromisso não gera notificações no telemóvel.',
  pauseUntil: 'Pausar até',
  pauseUntilHint:
    'Opcional: escolha o último dia da pausa; depois as notificações voltam sozinhas. Sem data = pausa sem prazo.',
  pauseUntilNone: 'Sem data limite',
  alertMode: 'Tipo de alerta',
  alertModeNormal: 'Normal',
  alertModeStrong: 'Forte',
  alertModeStrongHint:
    'Vibração mais longa. Dez minutos depois do primeiro alerta, enviamos um lembrete extra sobre o mesmo compromisso.',
  notificationStrongFollowupTitle: 'Lembrete adicional',
  done: 'Concluída',
  save: 'Salvar',
  saving: 'Salvando…',
  clear: 'Limpar',
  cancel: 'Cancelar',
  delete: 'Excluir',
  confirmDelete: 'Excluir tarefa?',
  confirmDeleteMessage: 'Esta ação não pode ser desfeita.',
  emptyMonth: 'Sem tarefas neste mês — toque em + para adicionar.',
  emptyDay: 'Sem tarefas neste dia.',
  emptyOnlyCompletedHidden:
    'Só há compromissos concluídos neste período.',
  emptyOnlyCompletedHiddenDay:
    'Só há compromissos concluídos neste dia.',
  taskTagOptional: 'Etiqueta (opcional)',
  tagWork: 'Trabalho',
  tagPersonal: 'Pessoal',
  tagHealth: 'Saúde',
  tagStudy: 'Estudo',
  tagFinance: 'Finanças',
  tagHome: 'Casa',
  sheetDragHint: 'Arraste para expandir ou fechar',
  emptyAll: 'Nenhuma tarefa ainda. Toque em + para começar.',
  settings: 'Configurações',
  theme: 'Tema',
  themeSystem: 'Sistema',
  themeLight: 'Claro',
  themeDark: 'Escuro',
  defaultNotification: 'Notificação padrão',
  data: 'Dados',
  exportJson: 'Exportar JSON',
  importJson: 'Importar JSON',
  importMode: 'Como importar?',
  importMerge: 'Mesclar com tarefas existentes',
  importReplace: 'Substituir tudo',
  backupDataHint:
    'O ficheiro inclui compromissos (com lembretes agendados), definições da app, notas e lembretes rápidos da aba Lembretes.',
  exportSuccess: 'Backup compartilhado.',
  lastBackupNever: 'Último backup: nunca',
  lastBackupToday: 'Último backup: hoje',
  lastBackupDaysAgo: 'Último backup: há {days} dias',
  backupReminder: 'Lembrar de exportar backup',
  backupReminderHint:
    'Notificação local para exportar o JSON. O export continua manual em Configurações.',
  backupReminderInterval: 'Intervalo do lembrete',
  backupReminderNotificationTitle: 'Hora de fazer backup',
  backupReminderNotificationBody:
    'Exporte o JSON em Configurações para guardar compromissos, notas e lembretes.',
  errorTitle: 'Erro',
  errorGeneric: 'Ocorreu um erro. Tente novamente.',
  importSuccess: 'Importação concluída.',
  importSuccessCounts:
    'Compromissos: {tasks} · Notas: {notes} · Lembretes rápidos: {quick}',
  importInvalid: 'Arquivo inválido ou versão incompatível.',
  permissionDenied:
    'Sem permissão de notificações. As notificações de compromissos não serão exibidas.',
  validationTitle: 'Informe um título.',
  validationEndDate: 'A data final deve ser igual ou posterior à inicial.',
  validationRecurrenceEndRequired: 'Indique até quando a repetição deve durar.',
  validationRecurrenceEndMax:
    'A repetição não pode passar de 1 ano após a data inicial. Crie outro compromisso se precisar de mais tempo.',
  validationPastInline:
    'Este horário já passou. Será salvo como concluído.',
  validationPastTitle: 'Data/hora no passado',
  validationPastMessage:
    'Você está salvando um compromisso no passado. Ele será registrado já como concluído.',
  validationPastContinue: 'Salvar como concluído',
  occurrenceBadge: 'Repetição',
  pastBadge: 'Passada',
  doneBadge: 'Concluída',
  deletePastInMonth: 'Apagar passadas do mês',
  deletePastInMonthConfirm:
    'Isso vai apagar de uma vez as tarefas passadas deste mês (não recorrentes).',
  deletePastInMonthDone: 'Tarefas passadas apagadas',
  deletePastInMonthNone: 'Não há tarefas passadas neste mês.',
  deletePastRecurringInMonth: 'Apagar recorrentes já encerradas',
  deletePastRecurringInMonthConfirm:
    'Isso vai apagar tarefas recorrentes deste mês que já terminaram. Esta ação não pode ser desfeita.',
  deletePastRecurringInMonthDone: 'Recorrentes encerradas apagadas',
  deletePastRecurringInMonthNone:
    'Não há recorrentes encerradas para apagar neste mês.',
  recurrenceSeriesWarning:
    'Esta tarefa se repete. Alterações afetam toda a série.',
  duplicate: 'Duplicar',
  search: 'Buscar',
  searchPlaceholder: 'Buscar por título...',
  filterMonth: 'Mês',
  filterToday: 'Hoje',
  filterNext7: 'Próx. 7 dias',
  filterOverdue: 'Atrasadas',
  filterDone: 'Concluídas',
  hideCompletedOccurrences: 'Ocultar concluídos',
  showCompletedOccurrences: 'Mostrar concluídos',
  monthActions: 'Ações do mês',
  quickRemindersTabHint:
    'Lembretes sem data. Segure o texto para editar. Alerta é opcional (sino).',
  quickRemindersReorderA11y: 'Segure para arrastar e reordenar',
  quickRemindersPlaceholder: 'Escreva um lembrete...',
  quickRemindersEmpty: 'Sem lembretes.',
  quickRemindersEditTitle: 'Editar lembrete',
  quickRemindersNotifyHint: 'Toque no sino para lembrar (opcional).',
  quickRemindersNotifyTitle: 'Alerta',
  quickRemindersNotifySchedule: 'Agendar',
  quickRemindersNotifyRemove: 'Remover alerta',
  quickRemindersNotifyPast: 'Escolha uma data e hora futuras.',
  quickReminderNotificationBody: 'Lembrete rápido',
  quickRemindersNotifyA11y: 'Agendar ou alterar alerta',
  quickRemindersNotifyScheduled: 'Alerta: {when}',
  notesTabHint:
    'Ao editar, use a barra inferior para opções.',
  notesEmptyList: 'Nenhuma nota ainda. Toque em + para criar.',
  newNote: 'Nova nota',
  editNote: 'Editar nota',
  notesTitlePlaceholder: 'Título (opcional)',
  notesBodyPlaceholder: 'Escreva sua nota…',
  notesEmpty: 'Adicione um título ou escreva algo no corpo da nota.',
  notesBodyTooLong: 'O texto da nota é grande demais. Reduza um pouco o conteúdo.',
  notesCharLabel: 'Texto (sem formatação)',
  notesDelete: 'Apagar nota',
  notesDeleteConfirm: 'Apagar esta nota? Esta ação não pode ser desfeita.',
  notesSelect: 'Selecionar',
  notesSelectCancel: 'Cancelar',
  notesDeleteSelected: 'Apagar',
  notesDeleteManyTitle: 'Apagar notas',
  notesDeleteManyMessage:
    'Apagar {n} nota(s) selecionada(s)? Esta ação não pode ser desfeita.',
  notebooksSection: 'Cadernos',
  rootNotesSection: 'Notas',
  newNotebook: 'Novo caderno',
  editNotebook: 'Editar caderno',
  notebookTitlePlaceholder: 'Nome do caderno',
  notebookEmpty: 'Nenhuma nota neste caderno.',
  notebookNoteCount: '{n} nota(s)',
  notesFabPrompt: 'O que deseja criar?',
  notebookDelete: 'Apagar caderno',
  notebookDeleteTitle: 'Apagar caderno',
  notebookDeleteEmptyConfirm:
    'Apagar este caderno? Esta ação não pode ser desfeita.',
  notebookDeleteWithNotes: 'Apagar caderno e notas selecionadas',
  notebookMoveSelectedToMain: 'Mover selecionadas para notas principais',
  notebookDeleteConfirmNotes:
    'Apagar o caderno e as {n} nota(s) selecionada(s)? Esta ação não pode ser desfeita.',
  notebookMoveThenDelete:
    'Mover as notas selecionadas para a lista principal e apagar o caderno?',
  notesMove: 'Mover',
  notesMoveTo: 'Mover para…',
  notesMovePickerTitle: 'Escolher destino',
  notesMoveToMain: 'Notas principais',
  notesLocation: 'Local',
  notesMoveDone: 'Notas movidas.',
  testNotification: 'Notificação de teste (10s)',
  testNotificationDone: 'Notificação de teste agendada.',
  appVersion: 'Versão do app',
  notificationLeadOff: 'Sem notificação',
  notificationLeadOnTime: 'Na hora',
  notificationLead5: '5 minutos antes',
  notificationLead10: '10 minutos antes',
  notificationLead30: '30 minutos antes',
  notificationLead60: '1 hora antes',
  notificationLead1440: '1 dia antes',
};

export function formatQuickReminderNotifyWhen(notifyAtIso: string): string {
  try {
    const d = parseISO(notifyAtIso);
    return format(d, "d/MM 'às' HH:mm", { locale: ptBR });
  } catch {
    return '';
  }
}

export function formatLastBackupLabel(iso: string | null): string {
  if (!iso) return t.lastBackupNever;
  try {
    const days = differenceInCalendarDays(new Date(), parseISO(iso));
    if (days <= 0) return t.lastBackupToday;
    return t.lastBackupDaysAgo.replace('{days}', String(days));
  } catch {
    return t.lastBackupNever;
  }
}

export function alertError(error: unknown): void {
  const detail =
    error instanceof Error ? error.message : error != null ? String(error) : '';
  Alert.alert(t.errorTitle, detail || t.errorGeneric);
}

export function notificationStrongFollowupBody(
  taskTitle: string,
  minutes: number
): string {
  return `Lembrete extra: ${taskTitle} (${minutes} min após o alerta). Toque para abrir.`;
}

export function recurrenceLabel(r: Recurrence): string {
  switch (r) {
    case 'none':
      return t.recurrenceNone;
    case 'daily':
      return t.recurrenceDaily;
    case 'weekdays':
      return t.recurrenceWeekdays;
    case 'weekly':
      return t.recurrenceWeekly;
    case 'monthly':
      return t.recurrenceMonthly;
    case 'custom':
      return t.recurrenceCustom;
    default:
      return t.recurrenceNone;
  }
}

export const WEEKDAY_PICK_ORDER: readonly number[] = [1, 2, 3, 4, 5, 6, 0];

const WEEKDAY_SHORT_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

export function weekdayShortPt(dayIndex: number): string {
  if (dayIndex < 0 || dayIndex > 6) return '?';
  return WEEKDAY_SHORT_PT[dayIndex];
}

export function notificationLeadLabel(value: number | null): string {
  switch (value) {
    case null:
      return t.notificationLeadOff;
    case 0:
      return t.notificationLeadOnTime;
    case 5:
      return t.notificationLead5;
    case 10:
      return t.notificationLead10;
    case 30:
      return t.notificationLead30;
    case 60:
      return t.notificationLead60;
    case 1440:
      return t.notificationLead1440;
    default:
      return `${value} min`;
  }
}

export function formatTaskCountdown(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    if (totalMinutes <= 1) return 'Resta 1 min';
    return `Restam ${totalMinutes} min`;
  }
  if (hours === 1) {
    if (minutes === 0) return 'Resta 1h';
    return `Resta 1h ${minutes}min`;
  }
  if (minutes === 0) return `Restam ${hours}h`;
  return `Restam ${hours}h ${minutes}min`;
}
