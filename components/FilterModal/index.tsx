import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

interface FilterOption {
	key: string;
	label: string;
}

interface FilterModalProps {
	visible: boolean;
	options: FilterOption[];
	selected: string;
	onSelect: (key: string) => void;
	onClose: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ visible, options, selected, onSelect, onClose }) => (
	<Modal visible={visible} transparent animationType="fade" statusBarTranslucent hardwareAccelerated onRequestClose={onClose}>
		<View style={styles.overlay}>
			<View style={styles.content}>
				<Text style={styles.title}>Filtrar Vacinas</Text>
				<View style={styles.options}>
					{options.map((option, idx) => (
						<TouchableOpacity
							key={option.key}
							style={[styles.option, selected === option.key && styles.selected]}
							onPress={() => onSelect(option.key)}
						>
							<Text style={[styles.optionText, selected === option.key && styles.selectedText]}>{option.label}</Text>
						</TouchableOpacity>
					))}
				</View>
				<TouchableOpacity style={styles.closeButton} onPress={onClose}>
					<Text style={styles.closeButtonText}>Fechar</Text>
				</TouchableOpacity>
			</View>
		</View>
	</Modal>
);

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.3)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 24,
		maxWidth: 340,
		alignItems: 'center',
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 18,
		color: '#29442dff',
	},
	options: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 8,
		marginBottom: 8,
	},
	option: {
		paddingVertical: 10,
		paddingHorizontal: 18,
		borderRadius: 8,
		marginBottom: 8,
		backgroundColor: '#F3F4F6',
		width: '45%',
		alignItems: 'center',
		marginRight: 8,
	},
	selected: {
		backgroundColor: '#29442d40',
	},
	optionText: {
		color: '#29442dff',
		fontSize: 15,
	},
	selectedText: {
		fontWeight: 'bold',
	},
	closeButton: {
		marginTop: 18,
		paddingVertical: 10,
		paddingHorizontal: 32,
		borderRadius: 8,
		backgroundColor: '#29442dff',
		width: '100%',
		alignItems: 'center',
	},
	closeButtonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 15,
	},
});