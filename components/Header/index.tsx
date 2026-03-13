import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface HeaderProps {
	title: string;
	onBack?: () => void;
	right?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, right }) => (
	<View style={styles.header}>
		{onBack && (
			<TouchableOpacity onPress={onBack}>
				<Ionicons name="chevron-back-outline" size={28} color="#29442dff" />
			</TouchableOpacity>
		)}
		<Text style={styles.headerTitle}>{title}</Text>
		{right || <View style={{ width: 28 }} />}
	</View>
);

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingTop: '10%',
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#29442dff',
	},
});