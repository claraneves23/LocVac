import { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { type Colors, radii, shadows, spacing, scaleTypography } from '../../../src/theme/tokens';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAccessibility } from '../../../src/context/AccessibilityContext';
import { DateField } from '../../redesign';
import { registrarDose, VacinaDTO } from '../../../src/service/mandatoryVaccineService';
import { MandatoryVaccineRecord } from '../../../src/types/vaccination';
import logger from '../../../src/utils/logger';
import { formatAge, formatDoseLabel } from '../../../src/utils/format';

type Props = {
  visible: boolean;
  vaccines: VacinaDTO[];
  records: MandatoryVaccineRecord[];
  pessoaId: number | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  minimumDate?: Date;
};

const todayIso = (): string => new Date().toISOString().split('T')[0];

type PendingEntry = { checked: boolean; date: string };

export default function QuickFillVaccinesModal({
  visible,
  vaccines,
  records,
  pessoaId,
  onClose,
  onSaved,
  minimumDate,
}: Props) {
  const { colors } = useTheme();
  const { fontScale } = useAccessibility();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);
  const [pending, setPending] = useState<Record<string, PendingEntry>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setPending({});
  }, [visible]);

  const groups = useMemo(() => {
    const map = new Map<number, VacinaDTO[]>();
    vaccines.forEach((v) => {
      const key = v.idadeMinimaMeses ?? 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    });
    return Array.from(map.keys())
      .sort((a, b) => a - b)
      .map((age) => ({ age, items: map.get(age)! }));
  }, [vaccines]);

  const appliedSet = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => { if (r.isApplied) s.add(r.vaccineId); });
    return s;
  }, [records]);

  const toggle = (vaccineId: string) => {
    setPending((p) => {
      const existing = p[vaccineId];
      if (existing?.checked) {
        const next = { ...p };
        delete next[vaccineId];
        return next;
      }
      return { ...p, [vaccineId]: { checked: true, date: todayIso() } };
    });
  };

  const setDate = (vaccineId: string, iso: string) => {
    setPending((p) => {
      const cur = p[vaccineId];
      if (!cur) return p;
      return { ...p, [vaccineId]: { ...cur, date: iso } };
    });
  };

  const pendingCount = Object.values(pending).filter((e) => e.checked).length;
  const canSave = pendingCount > 0 && !saving && pessoaId !== null;

  const handleSave = async () => {
    if (!canSave || pessoaId === null) return;
    setSaving(true);
    try {
      const entries = Object.entries(pending).filter(([, v]) => v.checked && v.date);
      for (const [vaccineId, entry] of entries) {
        await registrarDose({
          idPessoa: pessoaId,
          idVacina: Number(vaccineId),
          dataAplicacao: entry.date,
        });
      }
      await onSaved();
      onClose();
    } catch (e: any) {
      logger.error('Erro no preenchimento rápido:', e?.response?.status);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={onClose}
    >
      <StatusBar style="light" backgroundColor={colors.dimDark} translucent />
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>Preenchimento rápido</Text>
              <Text style={styles.title}>Marque as vacinas aplicadas</Text>
              <Text style={styles.subtitle}>
                Toque para marcar e ajuste a data abaixo se necessário.
              </Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.ink2} />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {groups.map(({ age, items }) => (
              <View key={age} style={styles.group}>
                <Text style={styles.groupLabel}>{formatAge(age)}</Text>
                {items.map((v) => {
                  const id = String(v.id);
                  const alreadyApplied = appliedSet.has(id);
                  const entry = pending[id];
                  const checked = alreadyApplied || !!entry?.checked;
                  return (
                    <View
                      key={id}
                      style={[styles.row, alreadyApplied && styles.rowDisabled]}
                    >
                      <Pressable
                        style={styles.rowMain}
                        onPress={() => !alreadyApplied && toggle(id)}
                        disabled={alreadyApplied}
                      >
                        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                          {checked && (
                            <Ionicons name="checkmark" size={14} color={colors.white} />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.vaccineName} numberOfLines={2}>
                            {v.nome}
                            {formatDoseLabel(v) ? <Text style={styles.doseLabel}>{` · ${formatDoseLabel(v)}`}</Text> : null}
                          </Text>
                          {alreadyApplied && (
                            <Text style={styles.alreadyLabel}>Já registrada</Text>
                          )}
                        </View>
                      </Pressable>
                      {!alreadyApplied && entry?.checked && (
                        <View style={styles.dateWrap}>
                          <Text style={styles.dateLabel}>Data de aplicação</Text>
                          <DateField
                            value={entry.date}
                            onChange={(iso) => setDate(id, iso)}
                            maximumDate={new Date()}
                            minimumDate={minimumDate}
                          />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
            <View style={{ height: spacing.md }} />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.cancelBtn, saving && styles.disabled]}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.saveBtn, !canSave && styles.disabled]}
              onPress={handleSave}
              disabled={!canSave}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.saveText}>
                  {pendingCount > 0 ? `Salvar ${pendingCount}` : 'Salvar'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (c: Colors, fontScale = 1, typography = scaleTypography(fontScale)) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: c.dimDark,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      maxHeight: '88%',
      backgroundColor: c.bgElev,
      borderRadius: radii.xl,
      padding: spacing.lg,
      ...shadows.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    kicker: {
      ...typography.caption,
      color: c.brandInk,
      textTransform: 'uppercase',
      fontWeight: '700',
      letterSpacing: 1,
      marginBottom: 2,
    },
    title: {
      ...typography.h3,
      color: c.ink,
      marginBottom: 4,
    },
    subtitle: {
      ...typography.small,
      color: c.ink3,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.bgMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: {
      marginVertical: spacing.md,
    },
    group: {
      marginBottom: spacing.md,
    },
    groupLabel: {
      ...typography.caption,
      fontWeight: '700',
      color: c.ink3,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 6,
    },
    row: {
      backgroundColor: c.bgMuted,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: c.line,
      paddingVertical: 10,
      paddingHorizontal: spacing.md,
      marginBottom: 6,
    },
    rowDisabled: {
      opacity: 0.55,
    },
    rowMain: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: c.brand,
      backgroundColor: c.bgElev,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: c.brand,
      borderColor: c.brand,
    },
    vaccineName: {
      ...typography.body,
      fontWeight: '600',
      color: c.ink,
    },
    doseLabel: {
      ...typography.small,
      fontWeight: '500',
      color: c.ink3,
    },
    alreadyLabel: {
      ...typography.caption,
      color: c.success,
      marginTop: 2,
    },
    dateWrap: {
      marginTop: spacing.sm,
      paddingLeft: 34,
      gap: 4,
    },
    dateLabel: {
      ...typography.caption,
      fontWeight: '600',
      color: c.ink3,
    },
    footer: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: radii.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.bgElev,
    },
    cancelText: {
      ...typography.body,
      fontWeight: '600',
      color: c.ink2,
    },
    saveBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: radii.md,
      alignItems: 'center',
      backgroundColor: c.brand,
    },
    saveText: {
      ...typography.body,
      fontWeight: '600',
      color: c.white,
    },
    disabled: {
      opacity: 0.55,
    },
  });
