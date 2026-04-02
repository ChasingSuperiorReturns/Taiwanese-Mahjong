import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Tile, PlayTile, FlowerType } from '@/src/engine/tiles';

interface TileDisplayProps {
  tile: Tile;
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

function getTileKey(tile: Tile): string {
  switch (tile.kind) {
    case 'suit': return `${tile.suit}_${tile.value}`;
    case 'wind': return `wind_${tile.wind}`;
    case 'dragon': return `dragon_${tile.dragon}`;
    case 'flower': return `flower_${tile.flower}`;
  }
}

// Static image map - Metro bundler requires literal require() paths
const TILE_IMAGES: Record<string, ImageSourcePropType> = {
  // 萬 (Characters / Man)
  'wan_1': require('../assets/images/tiles/Man1.png'),
  'wan_2': require('../assets/images/tiles/Man2.png'),
  'wan_3': require('../assets/images/tiles/Man3.png'),
  'wan_4': require('../assets/images/tiles/Man4.png'),
  'wan_5': require('../assets/images/tiles/Man5.png'),
  'wan_6': require('../assets/images/tiles/Man6.png'),
  'wan_7': require('../assets/images/tiles/Man7.png'),
  'wan_8': require('../assets/images/tiles/Man8.png'),
  'wan_9': require('../assets/images/tiles/Man9.png'),
  // 筒 (Circles / Pin)
  'tong_1': require('../assets/images/tiles/Pin1.png'),
  'tong_2': require('../assets/images/tiles/Pin2.png'),
  'tong_3': require('../assets/images/tiles/Pin3.png'),
  'tong_4': require('../assets/images/tiles/Pin4.png'),
  'tong_5': require('../assets/images/tiles/Pin5.png'),
  'tong_6': require('../assets/images/tiles/Pin6.png'),
  'tong_7': require('../assets/images/tiles/Pin7.png'),
  'tong_8': require('../assets/images/tiles/Pin8.png'),
  'tong_9': require('../assets/images/tiles/Pin9.png'),
  // 條 (Bamboo / Sou)
  'tiao_1': require('../assets/images/tiles/Sou1.png'),
  'tiao_2': require('../assets/images/tiles/Sou2.png'),
  'tiao_3': require('../assets/images/tiles/Sou3.png'),
  'tiao_4': require('../assets/images/tiles/Sou4.png'),
  'tiao_5': require('../assets/images/tiles/Sou5.png'),
  'tiao_6': require('../assets/images/tiles/Sou6.png'),
  'tiao_7': require('../assets/images/tiles/Sou7.png'),
  'tiao_8': require('../assets/images/tiles/Sou8.png'),
  'tiao_9': require('../assets/images/tiles/Sou9.png'),
  // Winds
  'wind_east': require('../assets/images/tiles/Ton.png'),
  'wind_south': require('../assets/images/tiles/Nan.png'),
  'wind_west': require('../assets/images/tiles/Shaa.png'),
  'wind_north': require('../assets/images/tiles/Pei.png'),
  // Dragons
  'dragon_red': require('../assets/images/tiles/Chun.png'),
  'dragon_green': require('../assets/images/tiles/Hatsu.png'),
  'dragon_white': require('../assets/images/tiles/Haku.png'),
};

// ─── Flower Data ───

interface FlowerInfo {
  char: string;
  num: number;
  color: string;
  group: 'plant' | 'season';
}

const FLOWER_INFO: Record<string, FlowerInfo> = {
  [FlowerType.Plum]:          { char: '梅', num: 1, color: '#cc2222', group: 'plant' },
  [FlowerType.Orchid]:        { char: '蘭', num: 2, color: '#1a7a2a', group: 'plant' },
  [FlowerType.Bamboo]:        { char: '竹', num: 3, color: '#1a7a2a', group: 'plant' },
  [FlowerType.Chrysanthemum]: { char: '菊', num: 4, color: '#cc2222', group: 'plant' },
  [FlowerType.Spring]:        { char: '春', num: 1, color: '#cc2222', group: 'season' },
  [FlowerType.Summer]:        { char: '夏', num: 2, color: '#cc2222', group: 'season' },
  [FlowerType.Autumn]:        { char: '秋', num: 3, color: '#1a5ea6', group: 'season' },
  [FlowerType.Winter]:        { char: '冬', num: 4, color: '#1a5ea6', group: 'season' },
};

// ─── Flower SVG Art ───

function PlumArt() {
  // 5-petal plum blossom
  const cx = 50, cy = 52, r = 11;
  const petals = [0, 72, 144, 216, 288].map(deg => {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + 20 * Math.cos(rad), y: cy + 20 * Math.sin(rad) };
  });
  return (
    <>
      {petals.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={r} fill="#cc2222" opacity={0.85} />
      ))}
      <Circle cx={cx} cy={cy} r={5} fill="#ffdd44" />
    </>
  );
}

function OrchidArt() {
  // Curved orchid leaves
  return (
    <>
      <Path d="M50,70 Q30,45 45,25" stroke="#1a7a2a" strokeWidth={3} fill="none" />
      <Path d="M50,70 Q70,45 55,25" stroke="#1a7a2a" strokeWidth={3} fill="none" />
      <Path d="M50,70 Q20,55 25,35" stroke="#1a7a2a" strokeWidth={2.5} fill="none" />
      <Path d="M50,70 Q80,55 75,35" stroke="#1a7a2a" strokeWidth={2.5} fill="none" />
      <Circle cx={50} cy={38} r={4} fill="#cc2222" />
      <Circle cx={45} cy={32} r={3} fill="#cc2222" opacity={0.7} />
      <Circle cx={55} cy={32} r={3} fill="#cc2222" opacity={0.7} />
    </>
  );
}

function BambooArt() {
  // Bamboo stalks with leaves
  return (
    <>
      <Line x1={40} y1={75} x2={40} y2={25} stroke="#1a7a2a" strokeWidth={3.5} />
      <Line x1={40} y1={40} x2={40} y2={41} stroke="#0d5a1a" strokeWidth={5} />
      <Line x1={40} y1={55} x2={40} y2={56} stroke="#0d5a1a" strokeWidth={5} />
      <Line x1={60} y1={75} x2={60} y2={30} stroke="#1a7a2a" strokeWidth={3.5} />
      <Line x1={60} y1={45} x2={60} y2={46} stroke="#0d5a1a" strokeWidth={5} />
      <Line x1={60} y1={60} x2={60} y2={61} stroke="#0d5a1a" strokeWidth={5} />
      <Path d="M40,30 Q25,22 20,28" stroke="#1a7a2a" strokeWidth={2} fill="#1a7a2a" opacity={0.7} />
      <Path d="M40,30 Q30,18 22,20" stroke="#1a7a2a" strokeWidth={2} fill="#1a7a2a" opacity={0.7} />
      <Path d="M60,35 Q75,27 80,33" stroke="#1a7a2a" strokeWidth={2} fill="#1a7a2a" opacity={0.7} />
      <Path d="M60,35 Q70,23 78,25" stroke="#1a7a2a" strokeWidth={2} fill="#1a7a2a" opacity={0.7} />
    </>
  );
}

function ChrysanthemumArt() {
  // Multi-petal chrysanthemum
  const cx = 50, cy = 50;
  const petals: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const px = cx + 18 * Math.cos(angle);
    const py = cy + 18 * Math.sin(angle);
    petals.push(
      <Path
        key={i}
        d={`M${cx},${cy} Q${cx + 8 * Math.cos(angle - 0.4)},${cy + 8 * Math.sin(angle - 0.4)} ${px},${py} Q${cx + 8 * Math.cos(angle + 0.4)},${cy + 8 * Math.sin(angle + 0.4)} ${cx},${cy}`}
        fill={i % 2 === 0 ? '#cc2222' : '#dd4444'}
      />
    );
  }
  return (
    <>
      {petals}
      <Circle cx={cx} cy={cy} r={5} fill="#ffdd44" />
    </>
  );
}

function SpringArt() {
  // Cherry blossom buds on branch
  return (
    <>
      <Path d="M25,70 Q40,50 60,30" stroke="#6b4226" strokeWidth={2.5} fill="none" />
      <Path d="M45,48 Q55,42 70,45" stroke="#6b4226" strokeWidth={2} fill="none" />
      <Circle cx={60} cy={30} r={7} fill="#ff6b8a" />
      <Circle cx={60} cy={30} r={3} fill="#ffdd44" />
      <Circle cx={70} cy={45} r={6} fill="#ff8fa6" />
      <Circle cx={70} cy={45} r={2.5} fill="#ffdd44" />
      <Circle cx={38} cy={55} r={5} fill="#ffb0c0" opacity={0.8} />
    </>
  );
}

function SummerArt() {
  // Lotus flower
  return (
    <>
      <Path d="M50,65 Q45,45 35,30" stroke="#cc2222" strokeWidth={2} fill="#ff6666" opacity={0.8} />
      <Path d="M50,65 Q50,40 50,25" stroke="#cc2222" strokeWidth={2} fill="#ff4444" opacity={0.9} />
      <Path d="M50,65 Q55,45 65,30" stroke="#cc2222" strokeWidth={2} fill="#ff6666" opacity={0.8} />
      <Path d="M50,65 Q40,48 28,38" stroke="#cc2222" strokeWidth={1.5} fill="#ff8888" opacity={0.6} />
      <Path d="M50,65 Q60,48 72,38" stroke="#cc2222" strokeWidth={1.5} fill="#ff8888" opacity={0.6} />
      <Circle cx={50} cy={55} r={4} fill="#ffdd44" />
    </>
  );
}

function AutumnArt() {
  // Maple leaf
  return (
    <>
      <Path d="M50,68 L50,42" stroke="#6b4226" strokeWidth={2} />
      <Path d="M50,42 L35,25 L42,38 L30,32 L40,42 L25,42 L38,47 L50,42" fill="#dd6622" />
      <Path d="M50,42 L65,25 L58,38 L70,32 L60,42 L75,42 L62,47 L50,42" fill="#cc5511" />
      <Path d="M50,42 L50,22" stroke="#dd6622" strokeWidth={2} fill="none" />
    </>
  );
}

function WinterArt() {
  // Snowflake
  const cx = 50, cy = 48;
  const arms: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * Math.PI / 180;
    const ex = cx + 20 * Math.cos(angle);
    const ey = cy + 20 * Math.sin(angle);
    arms.push(
      <Line key={`a${i}`} x1={cx} y1={cy} x2={ex} y2={ey} stroke="#1a5ea6" strokeWidth={2} />
    );
    // Small branch on each arm
    const bx = cx + 12 * Math.cos(angle);
    const by = cy + 12 * Math.sin(angle);
    const b1x = bx + 6 * Math.cos(angle + 0.7);
    const b1y = by + 6 * Math.sin(angle + 0.7);
    const b2x = bx + 6 * Math.cos(angle - 0.7);
    const b2y = by + 6 * Math.sin(angle - 0.7);
    arms.push(
      <Line key={`b1${i}`} x1={bx} y1={by} x2={b1x} y2={b1y} stroke="#1a5ea6" strokeWidth={1.5} />,
      <Line key={`b2${i}`} x1={bx} y1={by} x2={b2x} y2={b2y} stroke="#1a5ea6" strokeWidth={1.5} />
    );
  }
  return (
    <>
      {arms}
      <Circle cx={cx} cy={cy} r={3} fill="#1a5ea6" />
    </>
  );
}

const FLOWER_ART: Record<string, () => React.ReactNode> = {
  [FlowerType.Plum]: PlumArt,
  [FlowerType.Orchid]: OrchidArt,
  [FlowerType.Bamboo]: BambooArt,
  [FlowerType.Chrysanthemum]: ChrysanthemumArt,
  [FlowerType.Spring]: SpringArt,
  [FlowerType.Summer]: SummerArt,
  [FlowerType.Autumn]: AutumnArt,
  [FlowerType.Winter]: WinterArt,
};

function FlowerTileSvg({ flowerType, w, h }: { flowerType: FlowerType; w: number; h: number }) {
  const info = FLOWER_INFO[flowerType];
  if (!info) return null;
  const ArtComponent = FLOWER_ART[flowerType];
  const numSize = Math.max(10, w * 0.28);
  const charSize = Math.max(12, w * 0.32);

  return (
    <View style={{ width: w, height: h, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={w - 4} height={h - 4} viewBox="0 0 100 100">
        {/* Number in top-left */}
        <SvgText
          x={8}
          y={18}
          fontSize={numSize / w * 100}
          fontWeight="bold"
          fill={info.color}
          textAnchor="start"
        >
          {info.num}
        </SvgText>

        {/* Art in center */}
        <Svg x={0} y={10} width={100} height={65} viewBox="0 0 100 80">
          {ArtComponent && <ArtComponent />}
        </Svg>

        {/* Character at bottom */}
        <SvgText
          x={50}
          y={95}
          fontSize={charSize / w * 100}
          fontWeight="bold"
          fill={info.color}
          textAnchor="middle"
        >
          {info.char}
        </SvgText>
      </Svg>
    </View>
  );
}

const SIZES = {
  sm: { w: 28, h: 36, imgPad: 3 },
  md: { w: 36, h: 48, imgPad: 4 },
  lg: { w: 48, h: 64, imgPad: 5 },
};

export default function TileDisplay({ tile, size = 'md', highlighted = false }: TileDisplayProps) {
  const key = getTileKey(tile);
  const s = SIZES[size];
  const img = TILE_IMAGES[key];

  const isFlower = tile.kind === 'flower';

  return (
    <View style={[
      styles.tile,
      { width: s.w, height: s.h },
      highlighted && styles.highlighted,
    ]}>
      {isFlower ? (
        <FlowerTileSvg flowerType={tile.flower} w={s.w} h={s.h} />
      ) : img ? (
        <Image
          source={img}
          style={{
            width: s.w - s.imgPad * 2,
            height: s.h - s.imgPad * 2,
          }}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.fallbackText}>?</Text>
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
    overflow: 'hidden',
  },
  highlighted: {
    borderColor: '#c9a94e',
    borderWidth: 2,
    backgroundColor: '#fff8e8',
  },
  fallbackText: {
    fontSize: 14,
    color: '#999',
  },
});
