import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef, useCallback } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { minTouchTarget } from '../../theme/layout';
import { useSchedules, type DefenseSchedule } from '../../context/ScheduleContext';
import { checkConflicts } from '../../utils/conflictChecker';

/* ─── Placeholder data ─── */
const STAGES = [
  'Title Defense',
  'Review Defense',
  'Final Defense',
];

const PLACEHOLDER = {
  title:
    '',
  date: '',
  startTime: '3:00 PM',
  endTime: '6:00 PM',
  venue: 'JH 28, University of Nueva Caceres',
  researchers: [
    'Lea Roncesvalles',
    'Janna Mae Asa',
    'Andrey Quintela',
    'Dalia Mae Miralles',
  ],
  panelists: ['Ross Geller', 'Chandler Bing', 'Joey Tribbiani'],
  message: `Dear Panelist,`,
};

/* ─── Email templates per stage ─── */
function getEmailForStage(
  stage: string,
  startTime: string,
  endTime: string,
  date: string,
  venue: string,
  title: string,
): string {

  const greeting = 'Dear Panelist,';
  const link = 'LINK: https://meet.google.com/';
  const closing = 'We look forward to your participation!';

  if (stage === 'Title Defense') {
    return [

      greeting,
      `You're invited to join in our <b>Title Defense</b> on`,
      `${date} from ${startTime} to ${endTime} at ${venue}.`,
      '',
      `<b>Research Title:</b> ${title}`,
      '',
      'Please review the attached files prior to the defense.',
      link,
      '',
      closing,
    ].join('<br/>');
  }
  if (stage === 'Review Defense') {
    return [

      greeting,
      `We would like to invite you to our <b>Review Defense</b> on`,
      `${date} from ${startTime} to ${endTime} at ${venue}.`,
      '',
      `<b>Research Title:</b> ${title}`,
      '',
      'Please review the attached documents prior to the defense.',
      '',
      link,
      '',
      closing,
    ].join('<br/>');
  }
  if (stage === 'Final Defense') {
    return [

      greeting,
      `You are cordially invited to our <b>Final Defense</b> on`,
      `${date} from ${startTime} to ${endTime} at ${venue}.`,
      '',
      `<b>Research Title:</b> ${title}`,
      '',
      'Kindly find all final documents and manuscripts attached.',
      '',
      link,
      '',
      closing,
    ].join('<br/>');
  }
  // Fallback
  return PLACEHOLDER.message.replace(/\n/g, '<br/>');
}

/* ─── Mini Calendar date picker ─── */
const MINI_WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function MiniCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSame = (d: number) =>
    selectedDate &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getDate() === d;

  const isToday = (d: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === d;

  const isPast = (d: number) => {
    const cellDate = new Date(viewYear, viewMonth, d);
    return cellDate.getTime() < today.getTime();
  };

  return (
    <View style={styles.miniCal}>
      {/* Nav row */}
      <View style={styles.miniCalNav}>
        <TouchableOpacity onPress={goPrev} accessibilityLabel="Previous month">
          <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.miniCalTitle}>{monthLabel}</Text>
        <TouchableOpacity onPress={goNext} accessibilityLabel="Next month">
          <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={styles.miniCalRow}>
        {MINI_WEEKDAYS.map((w) => (
          <Text key={w} style={styles.miniCalWeekday}>{w}</Text>
        ))}
      </View>

      {/* Day cells */}
      <View style={styles.miniCalGrid}>
        {cells.map((day, i) => (
          <TouchableOpacity
            key={i}
            disabled={day === null || isPast(day)}
            onPress={() => day && onSelect(new Date(viewYear, viewMonth, day))}
            style={[
              styles.miniCalCell,
              day !== null && isSame(day) && styles.miniCalCellSelected,
              day !== null && isToday(day) && !isSame(day) && styles.miniCalCellToday,
            ]}
          >
            <Text
              style={[
                styles.miniCalDay,
                day !== null && isSame(day) && styles.miniCalDaySelected,
                day !== null && isPast(day) && styles.miniCalDayPast,
              ]}
            >
              {day ?? ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/* ─── Web select ─── */
function StageSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  if (Platform.OS === 'web') {
    return React.createElement(
      'select',
      {
        value,
        onChange: (e: { target: { value: string } }) => onChange(e.target.value),
        'aria-label': 'Stage of Defense',
        style: {
          width: '100%',
          padding: '12px 14px',
          border: `1.5px solid ${colors.borderSubtle}`,
          borderRadius: 10,
          fontSize: 15,
          color: value ? colors.textPrimary : '#9CA3AF',
          backgroundColor: '#fff',
          cursor: 'pointer',
          appearance: 'auto' as const,
        },
      },
      React.createElement('option', { value: '' }, '— Select Stage —'),
      ...STAGES.map((s) =>
        React.createElement('option', { key: s, value: s }, s),
      ),
    );
  }
  return (
    <TouchableOpacity
      style={styles.selectNative}
      onPress={() => {
        const idx = STAGES.indexOf(value);
        onChange(STAGES[(idx + 1) % STAGES.length]);
      }}
      accessibilityRole="combobox"
      accessibilityLabel="Stage of Defense"
    >
      <Text
        style={[
          styles.selectNativeText,
          !value && { color: '#9CA3AF' },
        ]}
      >
        {value || '— Select Stage —'}
      </Text>
      <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

/* ─── Checkbox row ─── */
function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.checkRow}
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
    >
      <View style={[styles.checkBox, checked && styles.checkBoxChecked]}>
        {checked && (
          <Ionicons name="checkmark" size={14} color="#fff" />
        )}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ─── Label ─── */
/* ─── Web Rich Text Editor ─── */
const RichTextEditor = React.memo(function RichTextEditor({
  initialHtml,
  onHtmlChange,
  attachments,
  onAttach,
  onRemoveAttachment,
}: {
  initialHtml: string;
  onHtmlChange: (html: string) => void;
  attachments: { name: string; size: number }[];
  onAttach: (files: FileList) => void;
  onRemoveAttachment: (index: number) => void;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onChangeRef = useRef(onHtmlChange);
  onChangeRef.current = onHtmlChange;
  const initRef = useRef(false);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const syncHtml = useCallback(() => {
    if (editorRef.current) onChangeRef.current(editorRef.current.innerHTML);
  }, []);

  const handleBold = () => exec('bold');
  const handleItalic = () => exec('italic');
  const handleUnderline = () => exec('underline');
  const handleStrike = () => exec('strikeThrough');
  const handleBulletList = () => exec('insertUnorderedList');
  const handleNumberList = () => exec('insertOrderedList');
  const handleLink = () => { const u = window.prompt('Enter URL:'); if (u) exec('createLink', u); };
  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) { onAttach(e.target.files); e.target.value = ''; }
  };

  const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.editorWrap}>
        <TextInput style={styles.editorInput} multiline defaultValue={initialHtml.replace(/<[^>]*>/g, '')}
          onChangeText={(t) => onHtmlChange(t)} textAlignVertical="top" accessibilityLabel="Additional message" />
      </View>
    );
  }

  return React.createElement('div', { style: { border: `1px solid ${colors.borderSubtle}`, borderRadius: 10, overflow: 'hidden', marginTop: 4 } },
    React.createElement('div', {
      style: {
        display: 'flex', flexDirection: 'row' as const, alignItems: 'center', gap: 4, padding: '6px 10px',
        borderBottom: `1px solid ${colors.borderSubtle}`, backgroundColor: '#FAFAFA', flexWrap: 'wrap' as const
      },
    },
      React.createElement('button', { onClick: handleAttachClick, title: 'Attach file', style: btnStyle, type: 'button' },
        React.createElement(Ionicons, { name: 'attach', size: 18, color: colors.textSecondary })),
      sep(),
      React.createElement('button', { onClick: handleBold, title: 'Bold', style: btnStyle, type: 'button' },
        React.createElement('span', { style: { fontWeight: 700, fontSize: 15 } }, 'B')),
      React.createElement('button', { onClick: handleItalic, title: 'Italic', style: btnStyle, type: 'button' },
        React.createElement('span', { style: { fontStyle: 'italic', fontSize: 15, fontWeight: 500 } }, 'I')),
      React.createElement('button', { onClick: handleUnderline, title: 'Underline', style: btnStyle, type: 'button' },
        React.createElement('span', { style: { textDecoration: 'underline', fontSize: 15 } }, 'U')),
      React.createElement('button', { onClick: handleStrike, title: 'Strikethrough', style: btnStyle, type: 'button' },
        React.createElement('span', { style: { textDecoration: 'line-through', fontSize: 15 } }, 'S')),
      sep(),
      React.createElement('button', { onClick: handleBulletList, title: 'Bulleted list', style: btnStyle, type: 'button' },
        React.createElement(Ionicons, { name: 'list', size: 18, color: colors.textSecondary })),
      React.createElement('button', { onClick: handleNumberList, title: 'Numbered list', style: btnStyle, type: 'button' },
        React.createElement('span', { style: { fontSize: 14, fontWeight: 600, color: colors.textSecondary } }, '1.')),
      sep(),
      React.createElement('button', { onClick: handleLink, title: 'Insert link', style: btnStyle, type: 'button' },
        React.createElement(Ionicons, { name: 'link', size: 18, color: colors.textSecondary })),
    ),
    React.createElement('input', { ref: fileInputRef, type: 'file', multiple: true, style: { display: 'none' }, onChange: handleFileChange }),
    React.createElement('div', {
      ref: (el: HTMLDivElement | null) => {
        editorRef.current = el;
        if (el && !initRef.current) { el.innerHTML = initialHtml; initRef.current = true; }
      },
      contentEditable: true,
      suppressContentEditableWarning: true,
      onBlur: syncHtml,
      style: { minHeight: 140, padding: 14, fontSize: 14, color: colors.textPrimary, lineHeight: '20px', outline: 'none', overflowY: 'auto' as const },
      'aria-label': 'Compose message',
    }),
    attachments.length > 0
      ? React.createElement('div', { style: { borderTop: `1px solid ${colors.borderSubtle}`, padding: '8px 14px', display: 'flex', flexWrap: 'wrap' as const, gap: 8 } },
        ...attachments.map((file, i) =>
          React.createElement('div', { key: i, style: { display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#F0F0F0', borderRadius: 6, padding: '4px 10px', fontSize: 13, color: colors.textPrimary } },
            React.createElement(Ionicons, { name: 'document-attach', size: 14, color: colors.textSecondary }),
            React.createElement('span', null, `${file.name} (${fmtSize(file.size)})`),
            React.createElement('button', { onClick: () => onRemoveAttachment(i), style: { ...btnStyle, padding: 2, marginLeft: 2 }, title: 'Remove', type: 'button' },
              React.createElement(Ionicons, { name: 'close-circle', size: 14, color: colors.textSecondary })),
          ),
        ),
      )
      : null,
  );
});
/* ─── Toolbar helpers ─── */
const btnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px 6px',
  borderRadius: 4,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 28,
  minHeight: 28,
};

function sep() {
  return React.createElement('div', {
    style: {
      width: 1,
      height: 20,
      backgroundColor: colors.borderSubtle,
      margin: '0 4px',
    },
  });
}

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <Text style={styles.fieldLabel}>
      {text}
      {required && <Text style={styles.asterisk}> *</Text>}
    </Text>
  );
}

/* ─── Researcher / Panelist pill ─── */
function PersonRow({
  name,
  color: dotColor,
}: {
  name: string;
  color: string;
}) {
  return (
    <View style={styles.personRow}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.personName}>{name}</Text>
    </View>
  );
}

/* ─── Main Modal ─── */
type Props = {
  visible: boolean;
  editSchedule?: DefenseSchedule | null;
  onClose: () => void;
};

export function ScheduleDefenseModal({ visible, editSchedule, onClose }: Props) {
  const { addSchedule, updateSchedule } = useSchedules();
  
  // Initialize state from editSchedule if available
  const [stage, setStage] = useState(editSchedule?.stage || '');
  const [title, setTitle] = useState(editSchedule?.title || PLACEHOLDER.title);
  const [date, setDate] = useState(editSchedule?.date || PLACEHOLDER.date);
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(editSchedule?.dateObj || null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [startTime, setStartTime] = useState(editSchedule?.startTime || PLACEHOLDER.startTime);
  const [endTime, setEndTime] = useState(editSchedule?.endTime || PLACEHOLDER.endTime);
  const [venue, setVenue] = useState(editSchedule?.venue || PLACEHOLDER.venue);
  const [messageHtml, setMessageHtml] = useState(
    editSchedule?.messageHtml || PLACEHOLDER.message.replace(/\n/g, '<br/>'),
  );
  const [editorVersion, setEditorVersion] = useState(0);
  const [attachments, setAttachments] = useState<{ name: string; size: number }[]>([]);
  const [approvedConcept, setApprovedConcept] = useState(editSchedule?.approvedConcept ?? false);
  const [paymentReceipt, setPaymentReceipt] = useState(editSchedule?.paymentReceipt ?? false);

  // Sync state when editSchedule changes
  React.useEffect(() => {
    if (visible && editSchedule) {
      setStage(editSchedule.stage);
      setTitle(editSchedule.title);
      setDate(editSchedule.date);
      setSelectedDateObj(editSchedule.dateObj);
      setStartTime(editSchedule.startTime);
      setEndTime(editSchedule.endTime);
      setVenue(editSchedule.venue);
      setMessageHtml(editSchedule.messageHtml);
      setApprovedConcept(editSchedule.approvedConcept);
      setPaymentReceipt(editSchedule.paymentReceipt);
      setEditorVersion((n) => n + 1);
    } else if (visible && !editSchedule) {
      // Reset form if opening in Create mode
      resetForm();
    }
  }, [visible, editSchedule]);

  // Regenerate email and bump editor key
  const regenerateEmail = useCallback((s: string, stime: string, etime: string, d: string, v: string, t: string) => {
    if (s) {
      setMessageHtml(getEmailForStage(s, stime, etime, d, v, t));
      setEditorVersion((n) => n + 1);
    }
  }, []);

  const handleStageChange = useCallback((newStage: string) => {
    setStage(newStage);
    regenerateEmail(newStage, startTime, endTime, date, venue, title);
  }, [startTime, endTime, date, venue, title, regenerateEmail]);

  const handleDateSelect = useCallback((d: Date) => {
    const formatted = d.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    setDate(formatted);
    setSelectedDateObj(d);
    setShowCalendar(false);
    regenerateEmail(stage, startTime, endTime, formatted, venue, title);
  }, [stage, venue, title, regenerateEmail]);

  // Debounced venue auto-update
  const venueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleVenueChange = useCallback((v: string) => {
    setVenue(v);
    if (venueTimer.current) clearTimeout(venueTimer.current);
    venueTimer.current = setTimeout(() => regenerateEmail(stage, startTime, endTime, date, v, title), 400);
  }, [stage, startTime, endTime, date, title, regenerateEmail]);

  // Debounced title auto-update
  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTitleChange = useCallback((t: string) => {
    setTitle(t);
    if (titleTimer.current) clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(() => regenerateEmail(stage, startTime, endTime, date, venue, t), 400);
  }, [stage, startTime, endTime, date, venue, regenerateEmail]);

  const handleAttach = useCallback((files: FileList) => {
    const newFiles = Array.from(files).map((f) => ({ name: f.name, size: f.size }));
    setAttachments((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const allFieldsFilled =
    !!stage &&
    !!title.trim() &&
    !!date.trim() &&
    !!startTime.trim() &&
    !!endTime.trim() &&
    !!venue.trim();

  const canSubmit = allFieldsFilled && approvedConcept && paymentReceipt;

  const [conflictError, setConflictError] = useState<string | null>(null);

  const resetForm = () => {
    setStage('');
    setTitle(PLACEHOLDER.title);
    setDate(PLACEHOLDER.date);
    setSelectedDateObj(null);
    setShowCalendar(false);
    setStartTime(PLACEHOLDER.startTime);
    setEndTime(PLACEHOLDER.endTime);
    setVenue(PLACEHOLDER.venue);
    setMessageHtml(PLACEHOLDER.message.replace(/\n/g, '<br/>'));
    setEditorVersion((n) => n + 1);
    setAttachments([]);
    setApprovedConcept(false);
    setPaymentReceipt(false);
    setConflictError(null);
  };

  const handleCancel = () => { resetForm(); onClose(); };

  const handleSubmit = () => {
    if (!canSubmit || !selectedDateObj) return;

    const scheduleData = {
      id: editSchedule ? editSchedule.id : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      stage, title, date,
      dateObj: new Date(selectedDateObj),
      startTime, endTime, venue,
      researchers: editSchedule ? editSchedule.researchers : [...PLACEHOLDER.researchers],
      panelists: editSchedule ? editSchedule.panelists : [...PLACEHOLDER.panelists],
      approvedConcept, paymentReceipt, messageHtml,
    };

    // Check for conflicts
    const conflictResult = checkConflicts(scheduleData, schedules);
    if (conflictResult.hasConflict) {
      setConflictError(conflictResult.message || 'A scheduling conflict was detected.');
      return;
    }

    if (editSchedule) {
      updateSchedule(editSchedule.id, scheduleData);
    } else {
      addSchedule(scheduleData);
    }

    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable
          style={styles.dialog}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{editSchedule ? 'Update Defense' : 'Schedule Defense'}</Text>
            <TouchableOpacity
              onPress={handleCancel}
              accessibilityLabel="Close dialog"
              accessibilityRole="button"
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator
          >
            {/* Stage of Defense */}
            <View style={styles.fieldRow}>
              <FieldLabel text="Stage of Defense" required />
              <View style={styles.fieldInput}>
                <StageSelect value={stage} onChange={handleStageChange} />
              </View>
            </View>

            {/* Title */}
            <View style={styles.fieldRow}>
              <FieldLabel text="Title" required />
              <View style={styles.fieldInput}>
                <View style={styles.titleBox}>
                  <TextInput
                    style={styles.titleBoxInput}
                    value={title}
                    onChangeText={handleTitleChange}
                    placeholder="Enter research title"
                    multiline
                    accessibilityLabel="Research title"
                  />
                </View>
              </View>
            </View>

            {/* Time and Date */}
            <View style={styles.fieldRow}>
              <FieldLabel text="Time and Date" required />
              <View style={styles.fieldInput}>
                <TouchableOpacity
                  style={styles.datePickerBtn}
                  onPress={() => setShowCalendar((v) => !v)}
                  accessibilityLabel="Pick defense date"
                  accessibilityRole="button"
                >
                  <Ionicons name="calendar-outline" size={16} color={colors.accentBlue} />
                  <Text style={styles.datePickerText}>
                    {date || 'Select a date'}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
                </TouchableOpacity>
                {showCalendar && (
                  <MiniCalendar
                    selectedDate={selectedDateObj}
                    onSelect={handleDateSelect}
                  />
                )}
                <View style={styles.timeRow}>
                  <View style={styles.timePill}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <TextInput
                      style={styles.timeInput}
                      value={startTime}
                      onChangeText={setStartTime}
                      placeholder="Start"
                      accessibilityLabel="Start time"
                    />
                  </View>
                  <Text style={styles.timeDash}>-</Text>
                  <View style={styles.timePill}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <TextInput
                      style={styles.timeInput}
                      value={endTime}
                      onChangeText={setEndTime}
                      placeholder="End"
                      accessibilityLabel="End time"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Venue */}
            <View style={styles.fieldRow}>
              <FieldLabel text="Venue" required />
              <View style={styles.fieldInput}>
                <View style={styles.venueRow}>
                  <Ionicons
                    name="location"
                    size={18}
                    color={colors.accentGreen}
                  />
                  <TextInput
                    style={styles.venueInput}
                    value={venue}
                    onChangeText={handleVenueChange}
                    placeholder="Enter venue"
                    accessibilityLabel="Venue"
                  />
                </View>
              </View>
            </View>

            {/* Researchers */}
            <View style={styles.fieldRow}>
              <FieldLabel text="Researchers" required />
              <View style={styles.fieldInput}>
                <View style={styles.peopleBox}>
                  {PLACEHOLDER.researchers.map((r) => (
                    <PersonRow key={r} name={r} color={colors.accentGreen} />
                  ))}
                </View>
              </View>
            </View>

            {/* Panelists */}
            <View style={styles.fieldRow}>
              <FieldLabel text="Panelists" required />
              <View style={styles.fieldInput}>
                <View style={styles.peopleBox}>
                  {PLACEHOLDER.panelists.map((p) => (
                    <PersonRow key={p} name={p} color={colors.accentBlue} />
                  ))}
                </View>
              </View>
            </View>

            {/* Requirements */}
            <View style={styles.fieldRow}>
              <FieldLabel text="Requirements" required />
              <View style={styles.fieldInput}>
                <CheckRow
                  label="Approved Concept Note"
                  checked={approvedConcept}
                  onToggle={() => setApprovedConcept((v) => !v)}
                />
                <CheckRow
                  label="Payment Receipt"
                  checked={paymentReceipt}
                  onToggle={() => setPaymentReceipt((v) => !v)}
                />
              </View>
            </View>

            {/* Rich text editor */}
            <RichTextEditor
              key={editorVersion}
              initialHtml={messageHtml}
              onHtmlChange={setMessageHtml}
              attachments={attachments}
              onAttach={handleAttach}
              onRemoveAttachment={handleRemoveAttachment}
            />
          </ScrollView>

          {conflictError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={colors.brandRed} />
              <Text style={styles.errorText}>{conflictError}</Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                !canSubmit && styles.submitBtnDisabled,
              ]}
              onPress={canSubmit ? handleSubmit : undefined}
              disabled={!canSubmit}
              accessibilityRole="button"
              accessibilityLabel="Schedule Defense"
              accessibilityState={{ disabled: !canSubmit }}
            >
              <Text
                style={[
                  styles.submitBtnText,
                  !canSubmit && styles.submitBtnTextDisabled,
                ]}
              >
                Schedule Defense
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 720,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flexShrink: 1,
  },
  bodyContent: {
    paddingHorizontal: 28,
    paddingVertical: 20,
  },

  /* ─── Field rows ─── */
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  fieldLabel: {
    width: 140,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingTop: 10,
  },
  asterisk: {
    color: colors.brandRed,
    fontWeight: '700',
  },
  fieldInput: {
    flex: 1,
  },

  /* ─── Select (native) ─── */
  selectNative: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  selectNativeText: {
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },

  /* ─── Title ─── */
  titleBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  titleBoxInput: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
    padding: 0,
  },

  /* ─── Date / time ─── */
  dateInput: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingVertical: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  timeInput: {
    fontSize: 14,
    color: colors.textPrimary,
    minWidth: 70,
    textAlign: 'center',
  },
  timeDash: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  /* ─── Venue ─── */
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  venueInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingVertical: 6,
  },

  /* ─── People ─── */
  peopleBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 6,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  personName: {
    fontSize: 14,
    color: colors.textPrimary,
  },

  /* ─── Requirements ─── */
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: minTouchTarget,
    paddingVertical: 4,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkBoxChecked: {
    backgroundColor: colors.accentGreen,
    borderColor: colors.accentGreen,
  },
  checkLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },

  /* ─── Editor ─── */
  editorWrap: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 4,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: '#FAFAFA',
  },
  tbBtn: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  editorInput: {
    minHeight: 140,
    padding: 14,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },

  /* ─── Footer ─── */
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
    borderRadius: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    minHeight: minTouchTarget,
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  submitBtn: {
    backgroundColor: colors.accentGreen,
    borderRadius: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    minHeight: minTouchTarget,
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#C8C8C8',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  submitBtnTextDisabled: {
    color: '#F0F0F0',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 28,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    color: colors.brandRed,
    fontWeight: '600',
    fontSize: 13,
    flex: 1,
  },

  /* ─── Mini Calendar ─── */
  miniCal: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  miniCalNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  miniCalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  miniCalRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  miniCalWeekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  miniCalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  miniCalCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  miniCalCellSelected: {
    backgroundColor: colors.accentBlue,
    borderRadius: 16,
  },
  miniCalCellToday: {
    borderWidth: 1,
    borderColor: colors.accentBlue,
    borderRadius: 16,
  },
  miniCalDay: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  miniCalDaySelected: {
    color: '#fff',
    fontWeight: '700',
  },
  miniCalDayPast: {
    color: '#CCCCCC',
  },

  /* ─── Date picker button ─── */
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  datePickerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
