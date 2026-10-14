// components/Icons.tsx
// 텍스트 글리프(›, ✕, ▼, •••, 🔍) 대신 쓰는 SVG 아이콘. 24x24 stroke 아이콘, 색은 color prop으로 지정.
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
}

const strokeProps = (color: string) => ({
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const ChevronRight = ({ color, size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 6l6 6-6 6" {...strokeProps(color)} />
  </Svg>
);

export const ChevronDown = ({ color, size = 16 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" {...strokeProps(color)} />
  </Svg>
);

export const ChevronUp = ({ color, size = 16 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 15l6-6 6 6" {...strokeProps(color)} />
  </Svg>
);

export const CloseIcon = ({ color, size = 16 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6l12 12M18 6L6 18" {...strokeProps(color)} />
  </Svg>
);

export const SearchIcon = ({ color, size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={7} {...strokeProps(color)} />
    <Path d="M20 20l-3.5-3.5" {...strokeProps(color)} />
  </Svg>
);

export const MoreIcon = ({ color, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Circle cx={5} cy={12} r={1.8} />
    <Circle cx={12} cy={12} r={1.8} />
    <Circle cx={19} cy={12} r={1.8} />
  </Svg>
);
