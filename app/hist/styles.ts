import { StyleSheet } from 'react-native';
import { colors, radii, typography } from '../theme/tokens';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 48,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: colors.bgMuted,
    borderRadius: radii.md,
    padding: 4,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: radii.sm + 2,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.bgElev,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink3,
  },
  tabTextActive: {
    color: colors.brand,
  },
  tabDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.coral,
    marginLeft: 2,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.line,
  },
  filterChipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink2,
    lineHeight: 16,
    includeFontPadding: false,
  },
  filterChipTextActive: {
    color: '#fff',
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgElev,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    fontSize: 22,
    color: colors.brand,
  },
  statLabel: {
    fontSize: 11,
    color: colors.ink3,
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  // Timeline
  timeline: {
    paddingTop: 6,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineRail: {
    width: 14,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 18,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.line,
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: colors.bgElev,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    marginBottom: 10,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  timelineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  timelineMetaText: {
    fontSize: 11,
    color: colors.ink3,
    fontWeight: '500',
  },
  timelineDetail: {
    marginTop: 6,
    fontSize: 12,
    color: colors.ink2,
    lineHeight: 17,
  },

  // Pending
  pendingCard: {
    backgroundColor: colors.bgElev,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 3,
    padding: 12,
    marginBottom: 8,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 56,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink2,
  },
  emptySub: {
    fontSize: 12,
    color: colors.ink3,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
