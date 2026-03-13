import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface IntroBoxProps {
	icon: React.ComponentProps<typeof Ionicons>["name"];
	title: string;
	text: string;
}

export const IntroBox: React.FC<IntroBoxProps> = ({ icon, title, text }) => (
	<View style={styles.introBox}>
		<Ionicons name={icon} size={48} color="#29442dff" />
		<Text style={styles.introTitle}>{title}</Text>
		<Text style={styles.introText}>{text}</Text>
	</View>
);

const styles = StyleSheet.create({
	introBox: {
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingVertical: 24,
		marginVertical: 16,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	introTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#29442dff',
		marginTop: 12,
	},
	introText: {
		fontSize: 13,
		color: '#666',
		marginHorizontal: 16,
		marginTop: 12,
		lineHeight: 18,
		textAlign: 'center',
	},
});