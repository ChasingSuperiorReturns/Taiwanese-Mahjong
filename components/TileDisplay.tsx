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

/** Single concentric-ring coin — all green */
function CoinSvg({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const outerStroke = Math.max(1.8, r * 0.2);
  const innerR = r * 0.55;
  const innerStroke = Math.max(1.2, r * 0.15);
  const dotR = Math.max(1, r * 0.15);
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill={CREAM} stroke={DARK_GREEN} strokeWidth={outerStroke} />
      <Circle cx={cx} cy={cy} r={innerR} fill={CREAM} stroke={DARK_GREEN} strokeWidth={innerStroke} />
      <Circle cx={cx} cy={cy} r={dotR} fill={DARK_GREEN} />
    </G>
  );
}

/** 1筒: Ornate rosette/medallion — green outer with red center */
function Rosette1Svg() {
  const petals = 12;
  const elements = [];
  // Decorative spokes
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
  // Petal dots at tips
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
      <Circle cx={50} cy={50} r={30} fill={CREAM} stroke={DARK_GREEN} strokeWidth={3} />
      <Circle cx={50} cy={50} r={26} fill={CREAM} stroke={DARK_GREEN} strokeWidth={1.5} />
      {elements}
      <Circle cx={50} cy={50} r={14} fill={CREAM} stroke={GREEN} strokeWidth={2.5} />
      <Circle cx={50} cy={50} r={9} fill={CREAM} stroke={RED} strokeWidth={2} />
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
// 條 (Bamboo/Sticks) — Vertical bamboo segments
// Each stick: tall capsule with horizontal node lines
// All uniform green — matches traditional Taiwanese tiles
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

/** Single bamboo stick — tall rounded rect with horizontal node notches */
function BambooStickSvg({ cx, cy, h, w, color }: { cx: number; cy: number; h: number; w: number; color: string }) {
  const outline = color === RED ? DARK_RED : DARK_GREEN;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const capH = h * 0.08;
  const nodeY1 = cy - h * 0.15;
  const nodeY2 = cy + h * 0.15;

  return (
    <G>
      {/* Main stick body — rounded rectangle */}
      <Rect x={x} y={y} width={w} height={h} rx={w / 2} ry={w / 2}
        fill={CREAM} stroke={outline} strokeWidth={1.6} />
      {/* Top cap */}
      <Rect x={x} y={y} width={w} height={capH} rx={w / 2} ry={w / 2}
        fill={outline} />
      {/* Bottom cap */}
      <Rect x={x} y={y + h - capH} width={w} height={capH} rx={w / 2} ry={w / 2}
        fill={outline} />
      {/* Node line 1 */}
      <Line x1={x + 1} y1={nodeY1} x2={x + w - 1} y2={nodeY1}
        stroke={outline} strokeWidth={1.4} />
      {/* Node line 2 */}
      <Line x1={x + 1} y1={nodeY2} x2={x + w - 1} y2={nodeY2}
        stroke={outline} strokeWidth={1.4} />
      {/* Center dot between nodes */}
      <Circle cx={cx} cy={cy} r={1.2} fill={color} />
    </G>
  );
}

/** 1條: Traditional bird (sparrow/peacock) — all green */
function BambooBirdSvg() {
  return (
    <G>
      {/* Tail feathers — sweeping curves */}
      <Path d="M 38 55 C 20 40, 10 25, 18 18 C 22 14, 28 18, 35 30 C 38 35, 38 45, 38 55 Z"
        fill={GREEN} stroke={DARK_GREEN} strokeWidth={0.8} />
      <Path d="M 34 58 C 14 48, 5 32, 12 24 C 16 20, 22 26, 30 38 C 33 43, 34 50, 34 58 Z"
        fill={DARK_GREEN} stroke={DARK_GREEN} strokeWidth={0.5} />
      <Path d="M 42 52 C 26 38, 22 22, 28 16 C 32 12, 36 18, 40 32 C 42 38, 42 46, 42 52 Z"
        fill="#3aaa4a" stroke={DARK_GREEN} strokeWidth={0.5} />
      {/* Body */}
      <Ellipse cx={50} cy={60} rx={18} ry={13} fill={GREEN} stroke={DARK_GREEN} strokeWidth={1} />
      {/* Wing */}
      <Ellipse cx={46} cy={57} rx={11} ry={6} fill="#3aaa4a" stroke={DARK_GREEN} strokeWidth={0.6} />
      {/* Head */}
      <Circle cx={64} cy={42} r={10} fill={RED} stroke={DARK_RED} strokeWidth={0.8} />
      {/* Eye */}
      <Circle cx={67} cy={40} r={2.5} fill="white" />
      <Circle cx={67.5} cy={39.5} r={1.2} fill="black" />
      {/* Beak */}
      <Path d="M 73 43 L 82 41 L 73 46 Z" fill="#d4a020" stroke="#8a6a10" strokeWidth={0.5} />
      {/* Crest */}
      <Path d="M 60 33 Q 56 27 60 24 Q 64 22 62 28 Z" fill={RED} />
      {/* Feet */}
      <Line x1={44} y1={73} x2={40} y2={84} stroke={DARK_GREEN} strokeWidth={1.5} />
      <Line x1={56} y1={73} x2={60} y2={84} stroke={DARK_GREEN} strokeWidth={1.5} />
      <Line x1={40} y1={84} x2={36} y2={87} stroke={DARK_GREEN} strokeWidth={1} />
      <Line x1={40} y1={84} x2={43} y2={87} stroke={DARK_GREEN} strokeWidth={1} />
      <Line x1={60} y1={84} x2={57} y2={87} stroke={DARK_GREEN} strokeWidth={1} />
      <Line x1={60} y1={84} x2={64} y2={87} stroke={DARK_GREEN} strokeWidth={1} />
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
