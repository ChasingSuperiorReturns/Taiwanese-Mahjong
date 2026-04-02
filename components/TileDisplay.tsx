import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, Ellipse, G, Line, Path } from 'react-native-svg';
import { PlayTile, Suit, Dragon } from '@/src/engine/tiles';

interface TileDisplayProps {
  tile: PlayTile;
  size?: 'sm' | 'md' | 'lg';
  highlighted?: boolean;
}

const TILE_LABELS: Record<string, string> = {
  'wan_1': '一萬', 'wan_2': '二萬', 'wan_3': '三萬',
  'wan_4': '四萬', 'wan_5': '五萬', 'wan_6': '六萬',
  'wan_7': '七萬', 'wan_8': '八萬', 'wan_9': '九萬',
  'tong_1': '一筒', 'tong_2': '二筒', 'tong_3': '三筒',
  'tong_4': '四筒', 'tong_5': '五筒', 'tong_6': '六筒',
  'tong_7': '七筒', 'tong_8': '八筒', 'tong_9': '九筒',
  'tiao_1': '一條', 'tiao_2': '二條', 'tiao_3': '三條',
  'tiao_4': '四條', 'tiao_5': '五條', 'tiao_6': '六條',
  'tiao_7': '七條', 'tiao_8': '八條', 'tiao_9': '九條',
  'wind_east': '東', 'wind_south': '南',
  'wind_west': '西', 'wind_north': '北',
  'dragon_red': '中', 'dragon_green': '發', 'dragon_white': '白',
};

const WAN_LABELS: Record<number, string> = {
  1: '一', 2: '二', 3: '三', 4: '四', 5: '五',
  6: '六', 7: '七', 8: '八', 9: '九',
};

// ─── Color constants ───
const GREEN = '#1a7a2a';
const DARK_GREEN = '#0d5e1a';
const RED = '#cc2222';
const DARK_RED = '#991a1a';
const NAVY = '#1a3a5a';
const CREAM = '#faf8f0';

const HONOR_LABELS: Record<string, string> = {
  'wind_east': '東', 'wind_south': '南',
  'wind_west': '西', 'wind_north': '北',
  'dragon_red': '中', 'dragon_green': '發', 'dragon_white': '白',
};

function getTileKey(tile: PlayTile): string {
  switch (tile.kind) {
    case 'suit': return `${tile.suit}_${tile.value}`;
    case 'wind': return `wind_${tile.wind}`;
    case 'dragon': return `dragon_${tile.dragon}`;
  }
}

function getTileColor(tile: PlayTile): string {
  if (tile.kind === 'dragon') {
    if (tile.dragon === Dragon.Red) return '#cc2222';
    if (tile.dragon === Dragon.Green) return '#1a8a2a';
    return '#444';
  }
  if (tile.kind === 'suit') {
    if (tile.suit === Suit.Wan) return '#cc2222';
    if (tile.suit === Suit.Tong) return '#1a5ea6';
    return '#1a8a2a';
  }
  return '#333';
}

const SIZES = {
  sm: { w: 28, h: 36, main: 14, sub: 8, svgSize: 24 },
  md: { w: 36, h: 48, main: 18, sub: 10, svgSize: 34 },
  lg: { w: 48, h: 64, main: 24, sub: 12, svgSize: 48 },
};

// ═══════════════════════════════════════════════
// 筒 (Circles/Coins) — Concentric ring pattern
// Each circle: outer ring → cream gap → inner ring → center dot
// Like traditional Chinese coins / archery targets
// ═══════════════════════════════════════════════

// Positions [cx, cy] in a 100×100 viewBox
const CIRCLE_POS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[50, 30], [50, 70]],
  3: [[50, 20], [50, 50], [50, 80]],
  4: [[33, 33], [67, 33], [33, 67], [67, 67]],
  5: [[30, 25], [70, 25], [50, 50], [30, 75], [70, 75]],
  6: [[33, 22], [67, 22], [33, 50], [67, 50], [33, 78], [67, 78]],
  7: [[50, 14], [30, 38], [70, 38], [50, 54], [30, 74], [70, 74], [50, 90]],
  8: [[33, 16], [67, 16], [33, 38], [67, 38], [33, 62], [67, 62], [33, 84], [67, 84]],
  9: [[25, 20], [50, 20], [75, 20], [25, 50], [50, 50], [75, 50], [25, 80], [50, 80], [75, 80]],
};

const CIRCLE_R: Record<number, number> = {
  1: 30, 2: 17, 3: 14, 4: 14, 5: 13, 6: 12, 7: 11, 8: 10, 9: 10,
};

// Traditional Taiwanese color per circle index — matches reference image
const CIRCLE_COLORS: Record<number, string[]> = {
  1: [GREEN],
  2: [GREEN, NAVY],
  3: [GREEN, RED, GREEN],
  4: [GREEN, GREEN, GREEN, GREEN],
  5: [GREEN, GREEN, RED, GREEN, GREEN],
  6: [RED, RED, RED, RED, RED, RED],
  7: [GREEN, GREEN, GREEN, RED, GREEN, GREEN, GREEN],
  8: [NAVY, NAVY, NAVY, NAVY, NAVY, NAVY, NAVY, NAVY],
  9: [GREEN, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN],
};

/** Single concentric-ring coin */
function CoinSvg({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  const outerStroke = Math.max(1.8, r * 0.18);
  const innerR = r * 0.55;
  const innerStroke = Math.max(1.2, r * 0.14);
  const dotR = Math.max(1, r * 0.15);
  return (
    <G>
      {/* Outer ring */}
      <Circle cx={cx} cy={cy} r={r} fill={CREAM} stroke={color} strokeWidth={outerStroke} />
      {/* Inner ring */}
      <Circle cx={cx} cy={cy} r={innerR} fill={CREAM} stroke={color} strokeWidth={innerStroke} />
      {/* Center dot */}
      <Circle cx={cx} cy={cy} r={dotR} fill={color} />
    </G>
  );
}

/** 1筒: Ornate rosette/medallion — green with decorative spokes */
function Rosette1Svg() {
  const petals = 12;
  const elements = [];
  for (let i = 0; i < petals; i++) {
    const angle = (i * 360) / petals;
    const rad = (angle * Math.PI) / 180;
    const x1 = 50 + 14 * Math.cos(rad);
    const y1 = 50 + 14 * Math.sin(rad);
    const x2 = 50 + 26 * Math.cos(rad);
    const y2 = 50 + 26 * Math.sin(rad);
    elements.push(
      <Line key={`spoke-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={DARK_GREEN} strokeWidth={2} />
    );
  }
  // Small circles at petal tips
  for (let i = 0; i < 8; i++) {
    const angle = (i * 360) / 8;
    const rad = (angle * Math.PI) / 180;
    const x = 50 + 24 * Math.cos(rad);
    const y = 50 + 24 * Math.sin(rad);
    elements.push(
      <Circle key={`petal-${i}`} cx={x} cy={y} r={3.5} fill={GREEN} stroke={DARK_GREEN} strokeWidth={1} />
    );
  }
  return (
    <G>
      {/* Outer decorative ring */}
      <Circle cx={50} cy={50} r={30} fill={CREAM} stroke={GREEN} strokeWidth={3} />
      <Circle cx={50} cy={50} r={26} fill={CREAM} stroke={DARK_GREEN} strokeWidth={1.5} />
      {/* Spokes */}
      {elements}
      {/* Inner rings */}
      <Circle cx={50} cy={50} r={14} fill={CREAM} stroke={GREEN} strokeWidth={2.5} />
      <Circle cx={50} cy={50} r={9} fill={CREAM} stroke={RED} strokeWidth={2} />
      {/* Center */}
      <Circle cx={50} cy={50} r={4} fill={RED} />
    </G>
  );
}

function CirclePattern({ value, size }: { value: number; size: 'sm' | 'md' | 'lg' }) {
  const s = SIZES[size];
  if (value === 1) {
    return (
      <Svg width={s.svgSize} height={s.svgSize} viewBox="0 0 100 100">
        <Rosette1Svg />
      </Svg>
    );
  }
  const positions = CIRCLE_POS[value];
  const r = CIRCLE_R[value];
  const colors = CIRCLE_COLORS[value];
  return (
    <Svg width={s.svgSize} height={s.svgSize} viewBox="0 0 100 100">
      {positions.map(([cx, cy], i) => (
        <CoinSvg key={i} cx={cx} cy={cy} r={r} color={colors[i]} />
      ))}
    </Svg>
  );
}

// ═══════════════════════════════════════════════
// 條 (Bamboo/Sticks) — Chain-link oval segments
// Each stick: 3 oval capsule segments stacked vertically
// Like connected links of a chain
// ═══════════════════════════════════════════════

// How many sticks per row for each value
const BAMBOO_LAYOUT: Record<number, number[][]> = {
  2: [[35, 65]],
  3: [[25, 50, 75]],
  4: [[30, 70], [30, 70]],
  5: [[25, 50, 75], [35, 65]],
  6: [[25, 50, 75], [25, 50, 75]],
  7: [[20, 40, 60, 80], [30, 50, 70]],
  8: [[20, 40, 60, 80], [20, 40, 60, 80]],
  9: [[25, 50, 75], [25, 50, 75], [25, 50, 75]],
};

// Colors for each stick (green/blue, with occasional red)
const BAMBOO_COLORS: Record<number, string[]> = {
  2: [GREEN, GREEN],
  3: [GREEN, RED, GREEN],
  4: [GREEN, GREEN, GREEN, GREEN],
  5: [GREEN, GREEN, RED, GREEN, GREEN],
  6: [GREEN, GREEN, GREEN, GREEN, GREEN, GREEN],
  7: [GREEN, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN],
  8: [GREEN, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN],
  9: [GREEN, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN],
};

/** Single chain-link bamboo stick — 3 oval segments connected */
function ChainStickSvg({ cx, cy, h, color }: { cx: number; cy: number; h: number; color: string }) {
  const segH = h * 0.28;    // height of each oval segment
  const segW = h * 0.22;    // width of each oval
  const gap = h * 0.04;     // gap between segments
  const totalH = segH * 3 + gap * 2;
  const startY = cy - totalH / 2;
  const outline = color === RED ? DARK_RED : DARK_GREEN;
  const lighter = color === GREEN ? '#3db85a' : (color === RED ? '#e85555' : '#3db85a');

  const segments = [];
  for (let i = 0; i < 3; i++) {
    const sy = startY + i * (segH + gap) + segH / 2;
    segments.push(
      <G key={i}>
        {/* Oval segment — outlined capsule */}
        <Ellipse cx={cx} cy={sy} rx={segW / 2} ry={segH / 2}
          fill={CREAM} stroke={outline} strokeWidth={1.8} />
        {/* Inner oval for depth */}
        <Ellipse cx={cx} cy={sy} rx={segW / 2 - 2.5} ry={segH / 2 - 2}
          fill="none" stroke={color} strokeWidth={1.3} />
        {/* Highlight dot at center of segment */}
        <Circle cx={cx} cy={sy} r={1} fill={color} />
      </G>
    );
    // Connector line between segments
    if (i < 2) {
      const lineY1 = sy + segH / 2;
      const lineY2 = sy + segH / 2 + gap;
      segments.push(
        <Line key={`conn-${i}`} x1={cx} y1={lineY1} x2={cx} y2={lineY2}
          stroke={outline} strokeWidth={1.5} />
      );
    }
  }
  // Top and bottom caps (small circles at ends)
  segments.push(
    <Circle key="top-cap" cx={cx} cy={startY} r={segW / 2 - 0.5}
      fill={outline} />,
    <Circle key="bot-cap" cx={cx} cy={startY + totalH} r={segW / 2 - 0.5}
      fill={outline} />
  );
  return <G>{segments}</G>;
}

/** 1條: Traditional bird (sparrow/peacock) */
function BambooBirdSvg() {
  return (
    <G>
      {/* Body — green feathered */}
      <Ellipse cx={50} cy={60} rx={20} ry={14} fill={GREEN} />
      {/* Wing detail */}
      <Ellipse cx={44} cy={56} rx={12} ry={7} fill="#3db85a" />
      <Ellipse cx={44} cy={56} rx={8} ry={4} fill={GREEN} />
      {/* Tail feathers */}
      <Path d="M 30 56 L 16 40 L 22 38 L 34 52 Z" fill={GREEN} />
      <Path d="M 28 60 L 12 48 L 18 46 L 32 56 Z" fill={DARK_GREEN} />
      <Path d="M 30 64 L 18 56 L 22 54 L 34 60 Z" fill="#3db85a" />
      {/* Head */}
      <Circle cx={66} cy={40} r={11} fill={RED} />
      {/* Eye ring */}
      <Circle cx={69} cy={38} r={3} fill="white" />
      <Circle cx={69.5} cy={37.5} r={1.3} fill="black" />
      {/* Beak */}
      <Path d="M 76 41 L 86 39 L 76 44 Z" fill="#d4a020" stroke="#8a6a10" strokeWidth={0.5} />
      {/* Crest/wattle */}
      <Path d="M 62 30 Q 58 26 62 24 Q 66 22 64 28 Z" fill={RED} />
      {/* Feet */}
      <Line x1={45} y1={74} x2={42} y2={84} stroke={DARK_RED} strokeWidth={1.5} />
      <Line x1={55} y1={74} x2={58} y2={84} stroke={DARK_RED} strokeWidth={1.5} />
      <Line x1={42} y1={84} x2={38} y2={86} stroke={DARK_RED} strokeWidth={1} />
      <Line x1={58} y1={84} x2={62} y2={86} stroke={DARK_RED} strokeWidth={1} />
    </G>
  );
}

function BambooPattern({ value, size }: { value: number; size: 'sm' | 'md' | 'lg' }) {
  const s = SIZES[size];

  if (value === 1) {
    return (
      <Svg width={s.svgSize} height={s.svgSize} viewBox="0 0 100 100">
        <BambooBirdSvg />
      </Svg>
    );
  }

  const layout = BAMBOO_LAYOUT[value];
  const colors = BAMBOO_COLORS[value];
  const numRows = layout.length;
  const stickH = numRows === 1 ? 80 : numRows === 2 ? 38 : 26;
  const rowSpacing = 100 / (numRows + 1);
  let colorIdx = 0;

  return (
    <Svg width={s.svgSize} height={s.svgSize} viewBox="0 0 100 100">
      {layout.map((row, rowIdx) => {
        const cy = rowSpacing * (rowIdx + 1);
        return row.map((cx, i) => {
          const c = colors[colorIdx % colors.length];
          colorIdx++;
          return (
            <ChainStickSvg
              key={`${rowIdx}-${i}`}
              cx={cx} cy={cy} h={stickH} color={c}
            />
          );
        });
      })}
    </Svg>
  );
}

// ═══════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════

export default function TileDisplay({ tile, size = 'md', highlighted = false }: TileDisplayProps) {
  const key = getTileKey(tile);
  const color = getTileColor(tile);
  const s = SIZES[size];

  const isHonor = tile.kind === 'wind' || tile.kind === 'dragon';
  const isTong = tile.kind === 'suit' && tile.suit === Suit.Tong;
  const isTiao = tile.kind === 'suit' && tile.suit === Suit.Tiao;
  const isWan = tile.kind === 'suit' && tile.suit === Suit.Wan;

  return (
    <View style={[
      styles.tile,
      { width: s.w, height: s.h },
      highlighted && styles.highlighted,
    ]}>
      {isTong && tile.kind === 'suit' && (
        <CirclePattern value={tile.value} size={size} />
      )}
      {isTiao && tile.kind === 'suit' && (
        <BambooPattern value={tile.value} size={size} />
      )}
      {isWan && (
        <>
          <Text style={[styles.mainChar, { fontSize: s.main, color }]}>
            {WAN_LABELS[tile.kind === 'suit' ? tile.value : 0]}
          </Text>
          <Text style={[styles.suitLabel, { fontSize: s.sub, color }]}>
            萬
          </Text>
        </>
      )}
      {isHonor && (
        <Text style={[styles.mainChar, { fontSize: s.main + 2, color }]}>
          {HONOR_LABELS[key] ?? '?'}
        </Text>
      )}
    </View>
  );
}

export { TILE_LABELS, getTileKey };

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#faf8f0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#c8c0a8',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
  },
  highlighted: {
    borderColor: '#c9a94e',
    borderWidth: 2,
    backgroundColor: '#fff8e8',
  },
  mainChar: {
    fontWeight: 'bold',
    lineHeight: undefined,
  },
  suitLabel: {
    marginTop: -2,
  },
});
