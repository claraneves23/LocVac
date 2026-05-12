import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../src/context/ThemeContext';

type Props = {
  size?: number;
  color?: string;
};

export default function LVMark({ size = 28, color }: Props) {
  const { colors } = useTheme();
  const fill = color ?? colors.brand;
  const height = size * (32 / 28);
  return (
    <Svg width={size} height={height} viewBox="0 0 28 32" fill="none">
      <Path
        d="M14 2c6.1 0 11 4.6 11 10.3 0 5.5-5.9 12.5-9.7 16.7a1.8 1.8 0 01-2.6 0C8.9 24.8 3 17.8 3 12.3 3 6.6 7.9 2 14 2z"
        fill={fill}
      />
      <Path
        d="M10.5 9.5v8h7"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={14} cy={13} r={1.2} fill="white" />
    </Svg>
  );
}
