import { View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ParticipatingCampaign } from '../../../app/types/vaccination';

const formatDateToBR = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

type CampaignsSectionProps = {
  campaigns: ParticipatingCampaign[];
  onOpenModal: (campaign?: ParticipatingCampaign) => void;
  onDelete: (campaignId: string) => void;
};

export default function CampaignsSection({ campaigns, onOpenModal, onDelete }: CampaignsSectionProps) {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>CAMPANHAS</Text>
        <Pressable style={styles.addButton} onPress={() => onOpenModal()}>
          <Ionicons name="add-circle" size={24} color="#09BEA5" />
        </Pressable>
      </View>

      {campaigns.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma campanha registrada.</Text>
      ) : (
        <View style={styles.campaignsContainer}>
          {campaigns.map((campaign) => (
            <Pressable
              key={campaign.id}
              style={styles.campaignItem}
              onPress={() => onOpenModal(campaign)}
            >
              <View style={styles.campaignHeader}>
                <View style={styles.campaignInfo}>
                  <View style={styles.campaignTexts}>
                    <Text style={styles.campaignName}>{campaign.campaignName}</Text>
                    <Text style={styles.campaignDesc}>
                      Participação em {formatDateToBR(campaign.participationDate)}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => onDelete(campaign.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionBlock: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 16,
    paddingTop: 12,
    paddingLeft: 4,
    fontWeight: '900',
    color: '#1f3322',
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#66776b',
  },
  campaignsContainer: {
    gap: 6,
  },
  campaignItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
    minHeight: 64,
    justifyContent: 'center',
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  campaignInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  campaignTexts: {
    flex: 1,
  },
  campaignName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f3322',
    marginBottom: 2,
  },
  campaignDesc: {
    fontSize: 12,
    color: '#66776b',
  },
});