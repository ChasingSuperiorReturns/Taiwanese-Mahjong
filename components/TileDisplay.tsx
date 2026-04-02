import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path } from 'react-native-svg';
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
// All uniform dark green — matches traditional Taiwanese tiles
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

/** Single concentric-ring coin — thin delicate green outlines like traditional tiles */
function CoinSvg({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const outerStroke = Math.max(1, r * 0.1);
  const midR = r * 0.65;
  const midStroke = Math.max(0.8, r * 0.08);
  const innerR = r * 0.35;
  const innerStroke = Math.max(0.6, r * 0.07);
  const dotR = Math.max(0.8, r * 0.1);
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill={CREAM} stroke={DARK_GREEN} strokeWidth={outerStroke} />
      <Circle cx={cx} cy={cy} r={midR} fill={CREAM} stroke={DARK_GREEN} strokeWidth={midStroke} />
      <Circle cx={cx} cy={cy} r={innerR} fill={CREAM} stroke={DARK_GREEN} strokeWidth={innerStroke} />
      <Circle cx={cx} cy={cy} r={dotR} fill={DARK_GREEN} />
    </G>
  );
}

/** 1筒: Ornate rosette/medallion — traditional decorative coin */
function Rosette1Svg() {
  const petals = 16;
  const spokeElements = [];
  // Fine decorative spokes radiating from center
  for (let i = 0; i < petals; i++) {
    const angle = (i * 360) / petals;
    const rad = (angle * Math.PI) / 180;
    const x1 = 50 + 12 * Math.cos(rad);
    const y1 = 50 + 12 * Math.sin(rad);
    const x2 = 50 + 24 * Math.cos(rad);
    const y2 = 50 + 24 * Math.sin(rad);
    spokeElements.push(
      <Line key={`spoke-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={DARK_GREEN} strokeWidth={1.2} />
    );
  }
  // Small decorative dots between rings
  const dotElements = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * 360) / 8 + 22.5;
    const rad = (angle * Math.PI) / 180;
    const x = 50 + 20 * Math.cos(rad);
    const y = 50 + 20 * Math.sin(rad);
    dotElements.push(
      <Circle key={`dot-${i}`} cx={x} cy={y} r={2} fill={GREEN} />
    );
  }
  return (
    <G>
      {/* Outer rings */}
      <Circle cx={50} cy={50} r={32} fill={CREAM} stroke={DARK_GREEN} strokeWidth={1.5} />
      <Circle cx={50} cy={50} r={28} fill={CREAM} stroke={DARK_GREEN} strokeWidth={1} />
      {spokeElements}
      {dotElements}
      {/* Inner rings */}
      <Circle cx={50} cy={50} r={12} fill={CREAM} stroke={GREEN} strokeWidth={1.5} />
      <Circle cx={50} cy={50} r={8} fill={CREAM} stroke={RED} strokeWidth={1.2} />
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
  return (
    <Svg width={s.svgSize} height={s.svgSize} viewBox="0 0 100 100">
      {positions.map(([cx, cy], i) => (
        <CoinSvg key={i} cx={cx} cy={cy} r={r} />
      ))}
    </Svg>
  );
}

// ═══════════════════════════════════════════════
// 條 (Bamboo/Sticks) — Two parallel vertical lines
// with horizontal crossbar rungs and circle caps
// Matches traditional Taiwanese tile artwork
// ═══════════════════════════════════════════════

// X positions of sticks per row, in a 100×100 viewBox
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

/** Single bamboo stick — two parallel vertical lines with horizontal rungs and circle caps */
function BambooStickSvg({ cx, cy, h, w, color }: { cx: number; cy: number; h: number; w: number; color: string }) {
  const outline = color === RED ? DARK_RED : DARK_GREEN;
  const gap = w * 0.45; // half-distance between the two parallel lines
  const x1 = cx - gap;
  const x2 = cx + gap;
  const top = cy - h / 2;
  const bot = cy + h / 2;
  const capR = gap * 0.9; // radius of end caps
  const strokeW = Math.max(0.8, w * 0.12);
  const rungStrokeW = Math.max(0.6, w * 0.1);

  // 4 evenly spaced rungs
  const numRungs = 4;
  const rungSpacing = h / (numRungs + 1);
  const rungs = [];
  for (let i = 1; i <= numRungs; i++) {
    const ry = top + rungSpacing * i;
    rungs.push(
      <Line key={`rung-${i}`} x1={x1} y1={ry} x2={x2} y2={ry}
        stroke={outline} strokeWidth={rungStrokeW} />
    );
  }

  return (
    <G>
      {/* Top cap — small circle */}
      <Circle cx={cx} cy={top} r={capR} fill={color} stroke={outline} strokeWidth={strokeW * 0.8} />
      {/* Bottom cap — small circle */}
      <Circle cx={cx} cy={bot} r={capR} fill={color} stroke={outline} strokeWidth={strokeW * 0.8} />
      {/* Left vertical line */}
      <Line x1={x1} y1={top} x2={x1} y2={bot} stroke={outline} strokeWidth={strokeW} />
      {/* Right vertical line */}
      <Line x1={x2} y1={top} x2={x2} y2={bot} stroke={outline} strokeWidth={strokeW} />
      {/* Horizontal rungs */}
      {rungs}
    </G>
  );
}

/** 1條: Traditional bird (sparrow/phoenix) — green body, red accents */
function BambooBirdSvg() {
  return (
    <G>
      {/* Tail feathers — flowing curves */}
      <Path d="M 40 60 C 22 45, 12 28, 20 18 C 24 14, 30 20, 36 34 C 39 40, 40 50, 40 60 Z"
        fill={GREEN} stroke={DARK_GREEN} strokeWidth={0.8} />
      <Path d="M 36 62 C 16 50, 6 34, 14 25 C 18 21, 24 28, 32 42 C 35 47, 36 55, 36 62 Z"
        fill={DARK_GREEN} stroke={DARK_GREEN} strokeWidth={0.5} />
      <Path d="M 44 56 C 28 42, 24 26, 30 18 C 34 14, 38 22, 42 36 C 44 42, 44 50, 44 56 Z"
        fill="#2a9a3a" stroke={DARK_GREEN} strokeWidth={0.5} />
      {/* Body */}
      <Ellipse cx={50} cy={60} rx={16} ry={12} fill={GREEN} stroke={DARK_GREEN} strokeWidth={1} />
      {/* Wing detail */}
      <Path d="M 42 56 Q 48 50 54 56 Q 48 54 42 56 Z" fill={DARK_GREEN} strokeWidth={0.3} />
      {/* Neck */}
      <Path d="M 56 52 Q 62 46 64 40" stroke={GREEN} strokeWidth={3} fill="none" />
      {/* Head */}
      <Circle cx={64} cy={38} r={8} fill={RED} stroke={DARK_RED} strokeWidth={0.8} />
      {/* Eye */}
      <Circle cx={67} cy={36} r={2} fill="white" />
      <Circle cx={67.5} cy={35.5} r={1} fill="black" />
      {/* Beak */}
      <Path d="M 71 39 L 80 37 L 72 42 Z" fill="#d4a020" stroke="#8a6a10" strokeWidth={0.5} />
      {/* Feet */}
      <Line x1={45} y1={72} x2={42} y2={84} stroke={DARK_GREEN} strokeWidth={1.2} />
      <Line x1={55} y1={72} x2={58} y2={84} stroke={DARK_GREEN} strokeWidth={1.2} />
      <Line x1={42} y1={84} x2={38} y2={87} stroke={DARK_GREEN} strokeWidth={0.8} />
      <Line x1={42} y1={84} x2={45} y2={87} stroke={DARK_GREEN} strokeWidth={0.8} />
      <Line x1={58} y1={84} x2={55} y2={87} stroke={DARK_GREEN} strokeWidth={0.8} />
      <Line x1={58} y1={84} x2={62} y2={87} stroke={DARK_GREEN} strokeWidth={0.8} />
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
  const numRows = layout.length;
  // Stick dimensions per row count
  const stickH = numRows === 1 ? 80 : numRows === 2 ? 36 : 24;
  const stickW = numRows === 1 ? 12 : numRows === 2 ? 10 : 8;
  const rowSpacing = 100 / (numRows + 1);

  // Color assignment: middle stick red for 3, 5; rest green
  const totalSticks = layout.reduce((sum, r) => sum + r.length, 0);
  let colorIdx = 0;
  const colors: string[] = [];
  for (const row of layout) {
    for (let i = 0; i < row.length; i++) {
      if ((value === 3 || value === 5) && colorIdx === Math.floor(totalSticks / 2)) {
        colors.push(RED);
      } else {
        colors.push(GREEN);
      }
      colorIdx++;
    }
  }

  let stickIdx = 0;
  return (
    <Svg width={s.svgSize} height={s.svgSize} viewBox="0 0 100 100">
      {layout.map((row, rowIdx) => {
        const cy = rowSpacing * (rowIdx + 1);
        return row.map((cx, i) => {
          const c = colors[stickIdx];
          stickIdx++;
          return (
            <BambooStickSvg
              key={`${rowIdx}-${i}`}
              cx={cx} cy={cy} h={stickH} w={stickW} color={c}
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
