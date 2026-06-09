import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

import {
  fetchMandatoryVaccines,
  fetchDosesPorPessoa,
  fetchOutrasVacinasPorPessoa,
  VacinaDTO,
} from '../../src/service/mandatoryVaccineService';
import { getCampaignsByProfile } from '../../src/storage/campaigns';
import { useAppContext } from '../../src/context/AppContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useAccessibility } from '../../src/context/AccessibilityContext';
import {
  FamilyMember,
  OtherVaccine,
  ParticipatingCampaign,
} from '../../src/types/vaccination';
import { type Colors, radii, shadows, spacing, scaleTypography } from '../../src/theme/tokens';
import {
  formatDateToBR,
  formatSex,
  formatCns,
  formatDoseLabel,
} from '../../src/utils/format';

const formatId = (id: string | undefined): string => {
  if (!id) return 'LV-XXXX';
  const padded = id.padStart(4, '0');
  return `LV-${new Date().getFullYear()}-${padded.slice(-4)}`;
};

const slugify = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'Perfil';

type VaccineRow = {
  name: string;
  dose: string;
  applied: boolean;
  date?: string;
  lot?: string;
  professional?: string;
};

export default function Carteira() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { fontScale } = useAccessibility();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);
  const { mainUser, dependents } = useAppContext();

  const profile = useMemo<FamilyMember | null>(() => {
    const all = [mainUser, ...dependents].filter(Boolean) as FamilyMember[];
    return all.find((p) => p.id === profileId) ?? mainUser;
  }, [mainUser, dependents, profileId]);

  const [mandatoryRows, setMandatoryRows] = useState<VaccineRow[]>([]);
  const [otherVaccines, setOtherVaccines] = useState<OtherVaccine[]>([]);
  const [campaigns, setCampaigns] = useState<ParticipatingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      try {
        const [vacinas, doses, others, localCampaigns] = await Promise.all([
          fetchMandatoryVaccines(),
          fetchDosesPorPessoa(Number(profile.id)),
          fetchOutrasVacinasPorPessoa(Number(profile.id)).catch(() => []),
          getCampaignsByProfile(profile.id),
        ]);
        if (!active) return;
        const rows: VaccineRow[] = vacinas.map((v: VacinaDTO) => {
          const dose = doses.find((d) => String(d.idVacina) === String(v.id));
          return {
            name: v.nome,
            dose: formatDoseLabel(v),
            applied: !!dose,
            date: dose?.dataAplicacao ?? undefined,
            lot: dose?.lote ?? undefined,
            professional: dose?.nomeProfissional ?? undefined,
          };
        });
        setMandatoryRows(rows);
        setOtherVaccines(
          others.map((d) => ({
            id: String(d.id),
            profileId: String(d.idPessoa),
            vaccineName: d.nomeVacina,
            applicationDate: d.dataAplicacao ?? undefined,
            lot: d.lote ?? undefined,
            code: d.observacao ?? undefined,
            professionalName: d.nomeProfissional ?? undefined,
            professionalId: d.registroProfissional ?? undefined,
          }))
        );
        setCampaigns(localCampaigns);
      } catch {
        if (!active) return;
        setMandatoryRows([]);
        setOtherVaccines([]);
        setCampaigns([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [profile]);

  const emittedAt = useMemo(() => formatDateToBR(new Date().toISOString().slice(0, 10)), []);

  const handleDownload = async () => {
    if (!profile) return;
    try {
      setDownloading(true);
      const docTitle = `Carteira_de_Vacinacao_${slugify(profile.name)}`;
      const html = buildCarteiraHtml(profile, mandatoryRows, otherVaccines, campaigns, emittedAt, docTitle);

      if (Platform.OS === 'web') {
        // No navegador o "download" é a janela de impressão (Salvar como PDF).
        // O nome sugerido vem do <title> do HTML e o cabeçalho de URL é removido pelo @page.
        await Print.printAsync({ html });
        return;
      }

      const { uri } = await Print.printToFileAsync({ html });

      // No app nativo, renomeia o arquivo (que vem com nome aleatório) para um nome legível.
      const named = new File(Paths.cache, `${docTitle}.pdf`);
      if (named.exists) named.delete();
      new File(uri).copy(named);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(named.uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${docTitle}.pdf`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Indisponível', 'Compartilhamento não está disponível neste dispositivo.');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar o PDF da carteira. Tente novamente.');
    } finally {
      setDownloading(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Header onBack={() => router.back()} styles={styles} ink={colors.ink} />
        <View style={styles.center}>
          <Text style={styles.emptyText}>Perfil não encontrado.</Text>
        </View>
      </View>
    );
  }

  const role =
    profile.kind === 'dependent' && profile.relationship ? profile.relationship : 'Titular';
  const municipio = [profile.city, profile.state].filter(Boolean).join(' - ');

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Header onBack={() => router.back()} styles={styles} ink={colors.ink} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Documento (preview do PDF) */}
          <View style={styles.doc}>
            {/* Cabeçalho */}
            <View style={styles.docHeader}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.docTitle}>Carteira de Vacinação Digital</Text>
                <Text style={styles.docSubtitle}>LocVac</Text>
              </View>
              <Text style={styles.docCode}>{formatId(profile.id)}</Text>
            </View>

            <View style={styles.docDivider} />

            {/* Identificação */}
            <Text style={styles.docSectionTitle}>Identificação</Text>
            <View style={styles.idGrid}>
              <IdItem label="Nome" value={profile.name} styles={styles} full />
              <IdItem label="Perfil" value={role} styles={styles} />
              <IdItem label="Nascimento" value={formatDateToBR(profile.birthDate)} styles={styles} />
              <IdItem label="Sexo" value={formatSex(profile.sex)} styles={styles} />
              {profile.cns ? <IdItem label="CNS" value={formatCns(profile.cns)} styles={styles} /> : null}
              {municipio ? <IdItem label="Município/UF" value={municipio} styles={styles} /> : null}
              {profile.kind === 'dependent' && profile.guardianName ? (
                <IdItem label="Responsável" value={profile.guardianName} styles={styles} full />
              ) : null}
            </View>

            <View style={styles.docDivider} />

            {/* Vacinas obrigatórias */}
            <Text style={styles.docSectionTitle}>Vacinas obrigatórias</Text>
            {mandatoryRows.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma vacina obrigatória cadastrada.</Text>
            ) : (
              <View style={styles.table}>
                {mandatoryRows.map((r, i) => (
                  <View key={`m-${i}`} style={[styles.row, i % 2 === 1 && styles.rowAlt]}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.rowTitle}>
                        {r.name}
                        {r.dose ? <Text style={styles.rowDose}>  ·  {r.dose}</Text> : null}
                      </Text>
                      {r.applied ? (
                        <Text style={styles.rowMeta}>
                          {[
                            r.date ? `Aplicada em ${formatDateToBR(r.date)}` : 'Aplicada',
                            r.lot ? `Lote ${r.lot}` : null,
                            r.professional || null,
                          ]
                            .filter(Boolean)
                            .join('  ·  ')}
                        </Text>
                      ) : null}
                    </View>
                    <View style={[styles.badge, r.applied ? styles.badgeOk : styles.badgePending]}>
                      <Text style={[styles.badgeText, r.applied ? styles.badgeTextOk : styles.badgeTextPending]}>
                        {r.applied ? 'Aplicada' : 'Pendente'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Outras vacinas */}
            {otherVaccines.length > 0 ? (
              <>
                <View style={styles.docDivider} />
                <Text style={styles.docSectionTitle}>Outras vacinas</Text>
                <View style={styles.table}>
                  {otherVaccines.map((o, i) => (
                    <View key={`o-${o.id}`} style={[styles.row, i % 2 === 1 && styles.rowAlt]}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.rowTitle}>{o.vaccineName}</Text>
                        <Text style={styles.rowMeta}>
                          {[
                            o.applicationDate ? `Aplicada em ${formatDateToBR(o.applicationDate)}` : null,
                            o.lot ? `Lote ${o.lot}` : null,
                            o.professionalName || null,
                          ]
                            .filter(Boolean)
                            .join('  ·  ') || 'Registrada'}
                        </Text>
                      </View>
                      <View style={[styles.badge, styles.badgeOk]}>
                        <Text style={[styles.badgeText, styles.badgeTextOk]}>Aplicada</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            {/* Campanhas */}
            {campaigns.length > 0 ? (
              <>
                <View style={styles.docDivider} />
                <Text style={styles.docSectionTitle}>Campanhas</Text>
                <View style={styles.table}>
                  {campaigns.map((c, i) => (
                    <View key={`c-${c.id}`} style={[styles.row, i % 2 === 1 && styles.rowAlt]}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.rowTitle}>{c.campaignName}</Text>
                        <Text style={styles.rowMeta}>
                          Participação em {formatDateToBR(c.participationDate)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            <View style={styles.docDivider} />
            <Text style={styles.docFooter}>Documento emitido em {emittedAt} pelo aplicativo LocVac.</Text>
          </View>
        </ScrollView>
      )}

      {/* Botão flutuante de download */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 4 }, (downloading || loading) && styles.fabDisabled]}
        onPress={handleDownload}
        disabled={downloading || loading}
        accessibilityRole="button"
        accessibilityLabel="Baixar carteira em PDF"
      >
        {downloading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="download-outline" size={20} color="#fff" />
        )}
      </Pressable>
    </View>
  );
}

function IdItem({
  label,
  value,
  styles,
  full,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
  full?: boolean;
}) {
  return (
    <View style={[styles.idItem, full && styles.idItemFull]}>
      <Text style={styles.idLabel}>{label}</Text>
      <Text style={styles.idValue} numberOfLines={2}>
        {value || '—'}
      </Text>
    </View>
  );
}

function Header({
  onBack,
  styles,
  ink,
}: {
  onBack: () => void;
  styles: ReturnType<typeof makeStyles>;
  ink: string;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.backBtn}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={20} color={ink} />
      </Pressable>
    </View>
  );
}

// ---------- PDF (HTML) ----------

const esc = (v: string | undefined | null): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function buildCarteiraHtml(
  profile: FamilyMember,
  mandatory: VaccineRow[],
  others: OtherVaccine[],
  campaigns: ParticipatingCampaign[],
  emittedAt: string,
  docTitle: string
): string {
  const role =
    profile.kind === 'dependent' && profile.relationship ? profile.relationship : 'Titular';
  const municipio = [profile.city, profile.state].filter(Boolean).join(' - ');

  const idRows = [
    ['Nome', profile.name],
    ['Perfil', role],
    ['Nascimento', formatDateToBR(profile.birthDate)],
    ['Sexo', formatSex(profile.sex)],
    profile.cns ? ['CNS', formatCns(profile.cns)] : null,
    municipio ? ['Município/UF', municipio] : null,
    profile.kind === 'dependent' && profile.guardianName
      ? ['Responsável', profile.guardianName]
      : null,
  ].filter(Boolean) as [string, string][];

  const idHtml = idRows
    .map(([l, v]) => `<div class="id-item"><span class="id-label">${esc(l)}</span><span class="id-value">${esc(v)}</span></div>`)
    .join('');

  const mandatoryRowsHtml = mandatory.length
    ? mandatory
        .map((r) => {
          const badge = r.applied
            ? '<span class="badge ok">Aplicada</span>'
            : '<span class="badge pending">Pendente</span>';
          return `<tr><td>${esc(r.name)}</td><td>${esc(r.dose || '—')}</td><td>${esc(r.applied && r.date ? formatDateToBR(r.date) : '—')}</td><td>${esc(r.applied ? r.lot || '—' : '—')}</td><td>${esc(r.applied ? r.professional || '—' : '—')}</td><td>${badge}</td></tr>`;
        })
        .join('')
    : '<tr><td colspan="6" class="empty">Nenhuma vacina obrigatória cadastrada.</td></tr>';

  const appliedCount = mandatory.filter((r) => r.applied).length;

  const othersHtml = others.length
    ? `<h2>Outras vacinas</h2><table><thead><tr><th>Vacina</th><th>Aplicação</th><th>Lote</th><th>Profissional</th></tr></thead><tbody>${others
        .map(
          (o) =>
            `<tr><td>${esc(o.vaccineName)}</td><td>${esc(o.applicationDate ? formatDateToBR(o.applicationDate) : '—')}</td><td>${esc(o.lot || '—')}</td><td>${esc(o.professionalName || '—')}</td></tr>`
        )
        .join('')}</tbody></table>`
    : '';

  const campaignsHtml = campaigns.length
    ? `<h2>Campanhas</h2><table><thead><tr><th>Campanha</th><th>Participação</th></tr></thead><tbody>${campaigns
        .map(
          (c) =>
            `<tr><td>${esc(c.campaignName)}</td><td>${esc(formatDateToBR(c.participationDate))}</td></tr>`
        )
        .join('')}</tbody></table>`
    : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(docTitle)}</title><style>
    /* margem na @page se aplica a TODAS as páginas (não só a primeira), garantindo o espaçamento no topo das páginas seguintes */
    @page { size: A4; margin: 16mm 14mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body { font-family: -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1A2422; font-size: 12px; line-height: 1.4; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 3px solid #03394A; padding-bottom: 12px; }
    .title { font-size: 22px; font-weight: 700; color: #03394A; margin: 0; }
    .subtitle { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #7C8786; margin-top: 2px; }
    .code { font-family: monospace; font-size: 12px; color: #03394A; background: #E5EEF2; padding: 4px 8px; border-radius: 6px; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #03394A; margin: 24px 0 8px; }
    .id-grid { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-top: 12px; }
    .id-item { display: flex; flex-direction: column; min-width: 160px; }
    .id-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.6px; color: #7C8786; }
    .id-value { font-size: 13px; font-weight: 600; }
    .summary { margin-top: 6px; font-size: 11px; color: #525E5C; }
    table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 11px; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th { text-align: left; background: #F1F5F4; color: #525E5C; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; padding: 7px 8px; border-bottom: 1px solid #E1E8E6; }
    td { padding: 7px 8px; border-bottom: 1px solid #E1E8E6; vertical-align: top; }
    .empty { color: #7C8786; font-style: italic; }
    .badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
    .badge.ok { background: #DEF1E5; color: #2C6B47; }
    .badge.pending { background: #F6D9D2; color: #5C2418; }
    .footer { margin-top: 28px; font-size: 10px; color: #7C8786; border-top: 1px solid #E1E8E6; padding-top: 10px; }
  </style></head><body>
    <div class="header">
      <div>
        <p class="title">Carteira de Vacinação Digital</p>
        <p class="subtitle">LocVac</p>
      </div>
      <span class="code">${esc(formatId(profile.id))}</span>
    </div>
    <h2>Identificação</h2>
    <div class="id-grid">${idHtml}</div>
    <h2>Vacinas obrigatórias</h2>
    <div class="summary">${appliedCount} de ${mandatory.length} doses aplicadas.</div>
    <table><thead><tr><th>Vacina</th><th>Dose</th><th>Aplicação</th><th>Lote</th><th>Profissional</th><th>Status</th></tr></thead><tbody>${mandatoryRowsHtml}</tbody></table>
    ${othersHtml}
    ${campaignsHtml}
    <div class="footer">Documento emitido em ${esc(emittedAt)} pelo aplicativo LocVac. Este documento é um espelho digital completo dos registros de vacinação do usuário.</div>
  </body></html>`;
}

const makeStyles = (c: Colors, fontScale = 1, typography = scaleTypography(fontScale)) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bgMuted,
      paddingTop: '5%' as any,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.sm,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.bgElev,
      borderWidth: 1,
      borderColor: c.line,
      alignItems: 'center',
      justifyContent: 'center',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: {
      padding: 16,
      paddingBottom: 96,
    },
    doc: {
      backgroundColor: c.bgElev,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: c.line,
      padding: 20,
      ...shadows.md,
    },
    docHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    docTitle: {
      ...typography.h3,
      color: c.brand,
      fontWeight: '700',
    },
    docSubtitle: {
      fontSize: 10,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: c.ink3,
      marginTop: 2,
    },
    docCode: {
      ...typography.mono,
      color: c.brandInk,
      backgroundColor: c.brandSoft,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radii.sm,
      overflow: 'hidden',
    },
    docDivider: {
      height: 1,
      backgroundColor: c.line,
      marginVertical: 16,
    },
    docSectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: c.brand,
      marginBottom: 10,
    },
    idGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: 12,
    },
    idItem: {
      width: '50%',
      paddingRight: 12,
    },
    idItemFull: {
      width: '100%',
    },
    idLabel: {
      fontSize: 9,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: c.ink3,
      marginBottom: 2,
    },
    idValue: {
      fontSize: 13,
      fontWeight: '600',
      color: c.ink,
    },
    table: {
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: radii.md,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    rowAlt: {
      backgroundColor: c.bgMuted,
    },
    rowTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: c.ink,
    },
    rowDose: {
      fontWeight: '400',
      color: c.ink3,
    },
    rowMeta: {
      fontSize: 11,
      color: c.ink2,
      marginTop: 2,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radii.pill,
    },
    badgeOk: {
      backgroundColor: c.successSoft,
    },
    badgePending: {
      backgroundColor: c.dangerSoft,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '700',
    },
    badgeTextOk: {
      color: c.successInk,
    },
    badgeTextPending: {
      color: c.dangerInk,
    },
    docFooter: {
      fontSize: 10,
      color: c.ink3,
      lineHeight: 14,
    },
    emptyText: {
      fontSize: 13,
      color: c.ink3,
    },
    fab: {
      position: 'absolute',
      right: 4,
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.brand,
      opacity: 0.82,
      ...shadows.md,
    },
    fabDisabled: {
      opacity: 0.6,
    },
  });
