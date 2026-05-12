import { StyleSheet } from 'react-native';
import { type Colors, radii, shadows, typography } from '../theme/tokens';

export const makeStyles = (c: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bg,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.bgMuted,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 130,
  },

  // Passport hero
  passport: {
    borderRadius: radii.xl,
    padding: 20,
    overflow: 'hidden',
    ...shadows.lg,
  },
  passportTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  passportCardLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  passportName: {
    ...typography.h2,
    color: '#fff',
    fontSize: 22,
    lineHeight: 28,
  },
  passportRole: {
    ...typography.mono,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 4,
  },
  passportDocBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  passportDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginVertical: 16,
  },
  passportInfoGrid: {
    gap: 12,
  },
  passportInfoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  passportInfoItem: {
    flex: 1,
    minWidth: 0,
  },
  passportInfoLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  passportInfoValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Filter chips
  filterRow: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: c.bgElev,
    borderWidth: 1,
    borderColor: c.line,
  },
  filterChipActive: {
    backgroundColor: c.brand,
    borderColor: c.brand,
  },
  filterChipText: {
    fontSize: 13,
    color: c.ink2,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },

  // Sections
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    ...typography.labelCap,
    color: c.ink2,
  },
  sectionCount: {
    ...typography.mono,
    color: c.ink3,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Group header
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: c.ink2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupActiveBadge: {
    backgroundColor: c.brand,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  groupActiveBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Item card
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: c.bgElev,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: c.line,
    padding: 14,
    marginBottom: 8,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: c.ink,
  },
  itemSub: {
    fontSize: 12,
    color: c.ink3,
    marginTop: 2,
  },
  iconBtn: {
    padding: 6,
  },

  // Empty
  emptyCard: {
    backgroundColor: c.bgElev,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: c.line,
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: c.ink3,
  },
});
