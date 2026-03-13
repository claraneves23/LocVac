import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface RecommendationBoxProps {
	icon?: React.ComponentProps<typeof Ionicons>["name"];
	text: string;
	color?: string;
}

export const RecommendationBox: React.FC<RecommendationBoxProps> = ({ icon = 'checkmark-circle-outline', text, color = '#4CAF50' }) => (
	<View style={styles.box}>
		<Ionicons name={icon} size={24} color={color} />
		<Text style={styles.text}>{text}</Text>
	</View>
);

const styles = StyleSheet.create({
	box: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 16,
		marginVertical: 12,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	text: {
		marginLeft: 12,
		color: '#29442dff',
		fontSize: 15,
	},
});