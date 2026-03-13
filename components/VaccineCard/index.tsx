import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface VaccineCardProps {
	name: string;
	description: string;
	benefit: string;
	onPress: () => void;
}

export const VaccineCard: React.FC<VaccineCardProps> = ({ name, description, benefit, onPress }) => (
	<TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
		<View style={styles.header}>
			<View style={styles.iconBox}>
				<Ionicons name="shield-checkmark-outline" size={28} color="#29442dff" />
			</View>
			<View style={styles.info}>
				<Text style={styles.name}>{name}</Text>
				<Text style={styles.desc}>{description}</Text>
			</View>
			<Ionicons name="chevron-forward-outline" size={24} color="#ACDAD8" />
		</View>
		<View style={styles.benefitBox}>
			<Text style={styles.benefitLabel}>Benefício:</Text>
			<Text style={styles.benefitText}>{benefit}</Text>
		</View>
	</TouchableOpacity>
);

const styles = StyleSheet.create({
	card: {
		backgroundColor: '#fff',
		borderRadius: 12,
		marginVertical: 8,
		padding: 16,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	iconBox: {
		marginRight: 12,
	},
	info: {
		flex: 1,
	},
	name: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#29442dff',
	},
	desc: {
		fontSize: 13,
		color: '#666',
	},
	benefitBox: {
		marginTop: 8,
	},
	benefitLabel: {
		fontWeight: 'bold',
		color: '#1976D2',
	},
	benefitText: {
		color: '#29442dff',
	},
});