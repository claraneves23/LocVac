import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface EffectCardProps {
	icon: React.ComponentProps<typeof Ionicons>["name"];
	title: string;
	severity: string;
	description: string;
	rare?: boolean;
	action?: string;
}

export const EffectCard: React.FC<EffectCardProps> = ({ icon, title, severity, description, rare, action }) => (
	<View style={[styles.card, rare && styles.rareCard]}>
		<View style={styles.header}>
			<Ionicons name={icon} size={24} color={rare ? '#D32F2F' : '#29442dff'} />
			<View style={styles.titleBox}>
				<Text style={styles.name}>{title}</Text>
				<View style={rare ? styles.severityTagRare : styles.severityTag}>
					<Text style={rare ? styles.severityTextRare : styles.severityText}>{severity}</Text>
				</View>
			</View>
		</View>
		<Text style={styles.description}>{description}</Text>
		{action && (
			<View style={styles.actionBox}>
				<Ionicons name="alert-outline" size={16} color="#D32F2F" />
				<Text style={styles.actionText}>{action}</Text>
			</View>
		)}
	</View>
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
	rareCard: {
		borderColor: '#D32F2F',
		borderWidth: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	titleBox: {
		marginLeft: 12,
	},
	name: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#29442dff',
	},
	severityTag: {
		backgroundColor: '#ACDAD8',
		borderRadius: 6,
		paddingHorizontal: 8,
		marginTop: 4,
	},
	severityText: {
		color: '#29442dff',
		fontWeight: 'bold',
	},
	severityTagRare: {
		backgroundColor: '#FFDAD4',
		borderRadius: 6,
		paddingHorizontal: 8,
		marginTop: 4,
	},
	severityTextRare: {
		color: '#D32F2F',
		fontWeight: 'bold',
	},
	description: {
		marginTop: 8,
		color: '#666',
	},
	actionBox: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
	},
	actionText: {
		color: '#D32F2F',
		marginLeft: 4,
	},
});