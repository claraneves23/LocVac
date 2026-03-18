import { View, Image, Pressable, Modal, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

type ImagePreviewModalProps = {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
};

export default function ImagePreviewModal({ visible, imageUri, onClose }: ImagePreviewModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={onClose}
    >
      <StatusBar style="light" backgroundColor="rgba(0, 0, 0, 0.75)" translucent />
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalCard}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 6,
    marginBottom: 6,
  },
  imagePreview: {
    width: '100%',
    height: 360,
    borderRadius: 12,
    backgroundColor: '#111',
  },
});