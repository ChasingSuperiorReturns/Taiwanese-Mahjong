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
  sm: { w: 28, h: 36, main: 14, sub: 8, svgW: 22, svgH: 28 },
  md: { w: 36, h: 48, main: 18, sub: 10, svgW: 28, svgH: 38 },
  lg: { w: 48, h: 64, main: 24, sub: 12, svgW: 38, svgH: 52 },
};

// ─── 筒 (Circles) — Solid colored circles like real tiles ───
// Grid positions for each value: [cx, cy] in a 100x100 viewBox
const CIRCLE_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[50, 30], [50, 70]],
  3: [[50, 20], [50, 50], [50, 80]],
  4: [[33, 33], [67, 33], [33, 67], [67, 67]],
  5: [[30, 25], [70, 25], [50, 50], [30, 75], [70, 75]],
  6: [[33, 22], [67, 22], [33, 50], [67, 50], [33, 78], [67, 78]],
  7: [[30, 20], [70, 20], [30, 50], [50, 50], [70, 50], [30, 80], [70, 80]],
  8: [[30, 18], [70, 18], [30, 40], [70, 40], [30, 62], [70, 62], [30, 84], [70, 84]],
  9: [[25, 20], [50, 20], [75, 20], [25, 50], [50, 50], [75, 50], [25, 80], [50, 80], [75, 80]],
};

// Circle radius per value (bigger when fewer circles)
const CIRCLE_RADII: Record<number, number> = {
  1: 28, 2: 18, 3: 14, 4: 14, 5: 13, 6: 12, 7: 11, 8: 10, 9: 10,
};

// Colors per circle — traditional Taiwanese pattern (red/green/blue mix)
const CIRCLE_COLORS: Record<number, string[]> = {
  1: ['#d42b2b'],
  2: ['#1a8a2a', '#d42b2b'],
  3: ['#1a8a2a', '#d42b2b', '#1a8a2a'],
  4: ['#1a8a2a', '#d42b2b', '#d42b2b', '#1a8a2a'],
  5: ['#1a8a2a', '#d42b2b', '#1a5ea6', '#d42b2b', '#1a8a2a'],
  6: ['#1a8a2a', '#d42b2b', '#1a8a2a', '#d42b2b', '#1a8a2a', '#d42b2b'],
  7: ['#1a8a2a', '#d42b2b', '#1a8a2a', '#1a5ea6', '#d42b2b', '#1a8a2a', '#d42b2b'],
  8: ['#1a8a2a', '#d42b2b', '#1a8a2a', '#d42b2b', '#d42b2b', '#1a8a2a', '#d42b2b', '#1a8a2a'],
  9: ['#1a8a2a', '#d42b2b', '#1a8a2a', '#d42b2b', '#1a5ea6', '#d42b2b', '#1a8a2a', '#d42b2b', '#1a8a2a'],
};

function CirclePattern({ value, size }: { value: number; size: 'sm' | 'md' | 'lg' }) {
  const s = SIZES[size];
  const positions = CIRCLE_POSITIONS[value];
  const r = CIRCLE_RADII[value];
  const colors = CIRCLE_COLORS[value];
  const ringW = Math.max(2, r * 0.28);

  return (
    <Svg width={s.svgW} height={s.svgH} viewBox="0 0 100 100">
      {positions.map(([cx, cy], i) => (
        <G key={i}>
          {/* Solid filled circle with ring border */}
          <Circle cx={cx} cy={cy} r={r} fill={colors[i]} />
          {/* Inner ring for coin look */}
          <Circle cx={cx} cy={cy} r={r - ringW} fill="none" stroke="#faf8f0" strokeWidth={ringW * 0.5} />
          {/* Center dot */}
          <Circle cx={cx} cy={cy} r={Math.max(1.5, r * 0.15)} fill="#faf8f0" />
        </G>
      ))}
    </Svg>
  );
}

// ─── 條 (Bamboo) — Thick segmented sticks ───
// Stick positions: [cx] per row, rows stacked vertically
const BAMBOO_LAYOUTS: Record<number, number[][]> = {
  1: [[50]],           // bird
  2: [[35, 65]],
  3: [[25, 50, 75]],
  4: [[35, 65], [35, 65]],
  5: [[25, 50, 75], [35, 65]],
  6: [[25, 50, 75], [25, 50, 75]],
  7: [[20, 40, 60, 80], [30, 50, 70]],
  8: [[20, 40, 60, 80], [20, 40, 60, 80]],
  9: [[25, 50, 75], [25, 50, 75], [25, 50, 75]],
};

const BAMBOO_COLORS: Record<number, string[]> = {
  2: ['#1a8a2a', '#1a5ea6'],
  3: ['#1a5ea6', '#1a8a2a', '#1a5ea6'],
  4: ['#1a8a2a', '#1a5ea6', '#1a5ea6', '#1a8a2a'],
  5: ['#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a5ea6'],
  6: ['#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a5ea6'],
  7: ['#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a8a2a', '#1a5ea6', '#1a8a2a'],
  8: ['#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a8a2a'],
  9: ['#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a5ea6'],
};

function BambooStickSvg({ cx, cy, w, h, color }: { cx: number; cy: number; w: number; h: number; color: string }) {
  const lighter = color === '#1a8a2a' ? '#3db85a' : '#4a9ad4';
  const darker = color === '#1a8a2a' ? '#0d5e1a' : '#0c3a66';
  const capH = h * 0.08;
  const nodeH = h * 0.04;

  return (
    <G>
      {/* Main body */}
      <Rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={w / 3} fill={color} />
      {/* Top cap */}
      <Rect x={cx - w / 2} y={cy - h / 2} width={w} height={capH} rx={w / 4} fill={darker} />
      {/* Bottom cap */}
      <Rect x={cx - w / 2} y={cy + h / 2 - capH} width={w} height={capH} rx={w / 4} fill={darker} />
      {/* Node lines */}
      <Line x1={cx - w / 2} y1={cy - h * 0.12} x2={cx + w / 2} y2={cy - h * 0.12} stroke={lighter} strokeWidth={nodeH} />
      <Line x1={cx - w / 2} y1={cy + h * 0.12} x2={cx + w / 2} y2={cy + h * 0.12} stroke={lighter} strokeWidth={nodeH} />
    </G>
  );
}

// 1索: Simplified bird (sparrow) — SVG version
function BambooBirdSvg() {
  return (
    <G>
      {/* Body */}
      <Ellipse cx={50} cy={58} rx={22} ry={16} fill="#1a8a2a" />
      {/* Wing */}
      <Ellipse cx={42} cy={54} rx={14} ry={8} fill="#3db85a" />
      {/* Head */}
      <Circle cx={65} cy={38} r={12} fill="#d42b2b" />
      {/* Eye */}
      <Circle cx={68} cy={36} r={2.5} fill="white" />
      <Circle cx={69} cy={36} r={1} fill="black" />
      {/* Beak */}
      <Path d="M 76 39 L 84 38 L 76 42 Z" fill="#e8a020" />
      {/* Tail */}
      <Path d="M 28 52 L 18 38 L 24 36 L 34 48 Z" fill="#1a5ea6" />
      <Path d="M 26 56 L 14 46 L 20 44 L 32 52 Z" fill="#0d5e1a" />
    </G>
  );
}

function BambooPattern({ value, size }: { value: number; size: 'sm' | 'md' | 'lg' }) {
  const s = SIZES[size];
  const layout = BAMBOO_LAYOUTS[value];

  if (value === 1) {
    return (
      <Svg width={s.svgW} height={s.svgH} viewBox="0 0 100 100">
        <BambooBirdSvg />
      </Svg>
    );
  }

  const colors = BAMBOO_COLORS[value];
  const numRows = layout.length;
  // Calculate stick dimensions to fill the space
  const stickH = numRows <= 2 ? 36 : 26;
  const stickW = 10;
  const rowSpacing = 100 / (numRows + 1);
  let colorIdx = 0;

  return (
    <Svg width={s.svgW} height={s.svgH} viewBox="0 0 100 100">
      {layout.map((row, rowIdx) => {
        const cy = rowSpacing * (rowIdx + 1);
        return row.map((cx, i) => {
          const c = colors[colorIdx % colors.length];
          colorIdx++;
          return (
            <BambooStickSvg
              key={`${rowIdx}-${i}`}
              cx={cx} cy={cy}
              w={stickW} h={stickH}
              color={c}
            />
          );
        });
      })}
    </Svg>
  );
}

// ─── Main component ───

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
