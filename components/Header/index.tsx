import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FamilyMember } from '../../app/types/vaccination';

// tipo de props para o controle de perfil do componente Header
type HeaderProps = {
  selectedProfile: FamilyMember;
  onOpenProfileModal: () => void;
  onOpenImagePreview: (uri?: string) => void;
};

export default function Header({ selectedProfile, onOpenProfileModal, onOpenImagePreview }: HeaderProps) {
  return (
    <View style={styles.topContainer}>
      <View style={styles.headerLeft}>
        <Image
          source={require('../../assets/images/locvaclogo-trim.png')}
          resizeMode="contain"
          style={styles.logoIcon}
        />
        <View>
          <Text style={styles.title}>
            <Text style={styles.titleLoc}>Loc</Text>
            <Text style={styles.titleVac}>Vac</Text>
          </Text>
          <Text style={styles.subtitle}>Carteira Digital Familiar</Text>
        </View>
      </View>

      <View style={styles.profileSwitcher}>
        {selectedProfile.photoUri ? (
          <Pressable
            style={styles.profileBadge}
            onPress={() => onOpenImagePreview(selectedProfile.photoUri)}
          >
            <Image source={{ uri: selectedProfile.photoUri }} style={styles.profileBadgeImage} />
          </Pressable>
        ) : (
          <Pressable style={styles.profileBadge} onPress={onOpenProfileModal}>
            <Text style={styles.profileBadgeText}>{selectedProfile.name.charAt(0)}</Text>
          </Pressable>
        )}
        <Pressable onPress={onOpenProfileModal}>
          <Ionicons name="chevron-down" size={16} color="#29442dff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    backgroundColor: '#ACDAD8',
    paddingRight: 12,
    paddingLeft: 8,
    paddingTop: '10%',
    paddingBottom: 14,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  titleLoc: {
    color: '#005570',
  },
  titleVac: {
    color: '#09BEA5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  logoIcon: {
    width: 48,
    height: 48,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#35573c',
  },
  profileSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#CAE3E2',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  profileBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#29442dff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  profileBadgeImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
});