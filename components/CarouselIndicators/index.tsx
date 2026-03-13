import React from 'react';
import { View, StyleSheet } from 'react-native';

interface CarouselIndicatorsProps {
	count: number;
	activeIndex: number;
}

export const CarouselIndicators: React.FC<CarouselIndicatorsProps> = ({ count, activeIndex }) => (
	<View style={styles.indicators}>
		{Array.from({ length: count }).map((_, index) => (
			<View
				key={index}
				style={[styles.indicator, activeIndex === index && styles.active]}
			/>
		))}
	</View>
);

const styles = StyleSheet.create({
	indicators: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 8,
	},
	indicator: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: '#ACDAD8',
		marginHorizontal: 4,
	},
	active: {
		backgroundColor: '#29442dff',
	},
});