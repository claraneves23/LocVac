import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DetailListProps {
	items: string[];
}

export const DetailList: React.FC<DetailListProps> = ({ items }) => (
	<View style={styles.section}>
		{items.map((detail, index) => (
			<View key={index} style={styles.detailItem}>
				<View style={styles.bullet} />
				<Text style={styles.detailText}>{detail}</Text>
			</View>
		))}
	</View>
);

const styles = StyleSheet.create({
	section: {
		marginVertical: 8,
	},
	detailItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 4,
	},
	bullet: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#29442dff',
		marginRight: 8,
	},
	detailText: {
		color: '#29442dff',
		fontSize: 14,
	},
});