import React, { useState, useCallback } from 'react';
import {
  StyleSheet, ScrollView, Pressable, Switch, Alert, Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import TilePicker from '@/components/TilePicker';
import TileDisplay, { getTileKey } from '@/components/TileDisplay';
import {
  PlayTile, Meld, MeldType, Wind, FlowerTile, FlowerType, flowerTile,
  tileKey, tilesEqual,
} from '@/src/engine/tiles';
import { createHand, Hand } from '@/src/engine/hand';
import { calculateScore, ScoreBreakdown } from '@/src/engine/scoring';
import { GameContext } from '@/src/engine/scoring/context';
import { TAI_CATALOG_MAP } from '@/src/data/tai-catalog';

type MeldSlot = {
  tiles: PlayTile[];
  type: 'chi' | 'pong' | 'kong';
  isConcealed: boolean;
};

const EMPTY_SLOT: MeldSlot = { tiles: [], type: 'pong', isConcealed: true };

const WIND_OPTIONS: { wind: Wind; label: string }[] = [
  { wind: Wind.East, label: '東' },
  { wind: Wind.South, label: '南' },
  { wind: Wind.West, label: '西' },
  { wind: Wind.North, label: '北' },
];

export default function CalculatorScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // 5 meld slots
  const [melds, setMelds] = useState<MeldSlot[]>(
    Array.from({ length: 5 }, () => ({ ...EMPTY_SLOT, tiles: [] }))
  );
  const [pair, setPair] = useState<PlayTile[]>([]);
  const [winningTileIdx, setWinningTileIdx] = useState<{ meld: number; tile: number } | 'pair'>('pair');
  const [activeMeld, setActiveMeld] = useState(0);
  const [editingPair, setEditingPair] = useState(false);

  // Context
  const [isSelfDraw, setIsSelfDraw] = useState(false);
  const [isDealer, setIsDealer] = useState(false);
  const [dealerStreak, setDealerStreak] = useState(0);
  const [isSingleWait, setIsSingleWait] = useState(false);
  const [roundWind, setRoundWind] = useState<Wind>(Wind.East);
  const [seatWind, setSeatWind] = useState<Wind>(Wind.East);
  const [flowers, setFlowers] = useState<FlowerTile[]>([]);
  const [isLastDiscard, setIsLastDiscard] = useState(false);
  const [isLastTileSelfDraw, setIsLastTileSelfDraw] = useState(false);
  const [isAfterKong, setIsAfterKong] = useState(false);
  const [isRobbingKong, setIsRobbingKong] = useState(false);

  // Results
  const [result, setResult] = useState<ScoreBreakdown | null>(null);

  const handleAddTile = useCallback((tile: PlayTile) => {
    if (editingPair) {
      setPair((prev) => {
        if (prev.length >= 2) return prev;
        return [...prev, tile];
      });
      return;
    }
    setMelds((prev) => {
      const next = [...prev];
      const slot = { ...next[activeMeld] };
      const maxTiles = slot.type === 'kong' ? 4 : 3;
      if (slot.tiles.length >= maxTiles) return prev;
      slot.tiles = [...slot.tiles, tile];
      next[activeMeld] = slot;
      return next;
    });
  }, [activeMeld, editingPair]);

  const handleAddFlower = useCallback((flower: FlowerTile) => {
    setFlowers((prev) => {
      if (prev.length >= 8) return prev;
      return [...prev, flower];
    });
  }, []);

  const toggleMeldType = (idx: number) => {
    setMelds((prev) => {
      const next = [...prev];
      const slot = { ...next[idx] };
      const types: MeldSlot['type'][] = ['chi', 'pong', 'kong'];
      const curIdx = types.indexOf(slot.type);
      slot.type = types[(curIdx + 1) % 3];
      slot.tiles = []; // reset tiles when changing type
      next[idx] = slot;
      return next;
    });
  };

  const clearMeld = (idx: number) => {
    setMelds((prev) => {
      const next = [...prev];
      next[idx] = { ...EMPTY_SLOT, tiles: [] };
      return next;
    });
  };

  const clearAll = () => {
    setMelds(Array.from({ length: 5 }, () => ({ ...EMPTY_SLOT, tiles: [] })));
    setPair([]);
    setFlowers([]);
    setResult(null);
    setIsSelfDraw(false);
    setIsDealer(false);
    setDealerStreak(0);
    setIsSingleWait(false);
    setRoundWind(Wind.East);
    setSeatWind(Wind.East);
    setIsLastDiscard(false);
    setIsLastTileSelfDraw(false);
    setIsAfterKong(false);
    setIsRobbingKong(false);
  };

  const doCalculate = () => {
    // Validate
    const filledMelds = melds.filter((m) => m.tiles.length > 0);
    if (filledMelds.length === 0 || pair.length !== 2) {
      const msg = '請至少填寫一個面子和雀頭 (Please fill at least one meld and the pair)';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('提示', msg);
      }
      return;
    }

    // Build Melds
    const builtMelds: Meld[] = filledMelds.map((slot) => {
      let meldType: MeldType;
      if (slot.type === 'chi') meldType = MeldType.Chi;
      else if (slot.type === 'pong') meldType = MeldType.Pong;
      else meldType = slot.isConcealed ? MeldType.ConcealedKong : MeldType.Kong;

      return {
        type: meldType,
        tiles: slot.tiles,
        isConcealed: slot.isConcealed,
      };
    });

    // Determine winning tile
    let winTile: PlayTile;
    if (winningTileIdx === 'pair') {
      winTile = pair[pair.length - 1];
    } else {
      const m = melds[winningTileIdx.meld];
      winTile = m.tiles[m.tiles.length - 1];
    }

    const hand: Hand = createHand(builtMelds, [pair[0], pair[1]], winTile, isSingleWait);

    const ctx: Partial<GameContext> = {
      isSelfDraw,
      isDealer,
      dealerStreak: isDealer ? dealerStreak : 0,
      roundWind,
      seatWind,
      flowers,
      isLastDiscard,
      isLastTileSelfDraw,
      isAfterKong,
      isRobbingKong,
    };

    const score = calculateScore(hand, ctx);
    setResult(score);
  };

  const meldTypeLabel = (t: string) => {
    if (t === 'chi') return '吃(順)';
    if (t === 'pong') return '碰(刻)';
    return '槓';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>面子 Melds</Text>

      {melds.map((slot, idx) => (
        <Pressable
          key={idx}
          onPress={() => { setActiveMeld(idx); setEditingPair(false); }}
          style={[
            styles.meldRow,
            {
              backgroundColor: colors.card,
              borderColor: activeMeld === idx && !editingPair ? colors.accent : colors.cardBorder,
              borderWidth: activeMeld === idx && !editingPair ? 2 : 1,
            },
          ]}
        >
          <View style={styles.meldHeader}>
            <Text style={[styles.meldLabel, { color: colors.text }]}>
              {idx + 1}.
            </Text>
            <Pressable onPress={() => toggleMeldType(idx)} style={[styles.typeBtn, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.typeBtnText, { color: colors.tint }]}>{meldTypeLabel(slot.type)}</Text>
            </Pressable>
            <Pressable
              onPress={() => setMelds((prev) => {
                const next = [...prev];
                next[idx] = { ...next[idx], isConcealed: !next[idx].isConcealed };
                return next;
              })}
              style={[styles.typeBtn, { borderColor: colors.cardBorder }]}
            >
              <Text style={[styles.typeBtnText, { color: colors.tint }]}>
                {slot.isConcealed ? '暗' : '明'}
              </Text>
            </Pressable>
            <Pressable onPress={() => clearMeld(idx)}>
              <Text style={styles.clearBtn}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.meldTiles}>
            {slot.tiles.map((t, ti) => (
              <Pressable key={ti} onPress={() => setWinningTileIdx({ meld: idx, tile: ti })}>
                <TileDisplay
                  tile={t}
                  size="md"
                  highlighted={
                    winningTileIdx !== 'pair' &&
                    winningTileIdx.meld === idx &&
                    winningTileIdx.tile === ti
                  }
                />
              </Pressable>
            ))}
            {slot.tiles.length < (slot.type === 'kong' ? 4 : 3) && (
              <View style={styles.emptyTile}>
                <Text style={styles.emptyText}>+</Text>
              </View>
            )}
          </View>
        </Pressable>
      ))}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>雀頭 Pair</Text>
      <Pressable
        onPress={() => setEditingPair(true)}
        style={[
          styles.meldRow,
          {
            backgroundColor: colors.card,
            borderColor: editingPair ? colors.accent : colors.cardBorder,
            borderWidth: editingPair ? 2 : 1,
          },
        ]}
      >
        <View style={styles.meldTiles}>
          {pair.map((t, i) => (
            <Pressable key={i} onPress={() => setWinningTileIdx('pair')}>
              <TileDisplay
                tile={t}
                size="md"
                highlighted={winningTileIdx === 'pair' && i === pair.length - 1}
              />
            </Pressable>
          ))}
          {pair.length < 2 && (
            <View style={styles.emptyTile}>
              <Text style={styles.emptyText}>+</Text>
            </View>
          )}
        </View>
        <Pressable onPress={() => setPair([])}>
          <Text style={styles.clearBtn}>✕</Text>
        </Pressable>
      </Pressable>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>選牌 Pick Tiles</Text>
      <View style={[styles.pickerBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <TilePicker
          onSelectTile={handleAddTile}
          onSelectFlower={handleAddFlower}
          showFlowers
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>胡牌條件 Context</Text>
      <View style={[styles.contextBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <ToggleRow label="自摸 Self-draw" value={isSelfDraw} onToggle={setIsSelfDraw} colors={colors} />
        <ToggleRow label="莊家 Dealer" value={isDealer} onToggle={setIsDealer} colors={colors} />
        {isDealer && (
          <View style={styles.streakRow}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>連莊 Streak</Text>
            <View style={styles.streakBtns}>
              {[0, 1, 2, 3, 4].map((n) => (
                <Pressable
                  key={n}
                  onPress={() => setDealerStreak(n)}
                  style={[styles.streakBtn, dealerStreak === n && { backgroundColor: colors.accent }]}
                >
                  <Text style={[styles.streakBtnText, dealerStreak === n && { color: '#fff' }]}>{n}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        <ToggleRow label="獨聽 Single wait" value={isSingleWait} onToggle={setIsSingleWait} colors={colors} />
        <ToggleRow label="河底撈魚 Last discard" value={isLastDiscard} onToggle={setIsLastDiscard} colors={colors} />
        <ToggleRow label="海底撈月 Last self-draw" value={isLastTileSelfDraw} onToggle={setIsLastTileSelfDraw} colors={colors} />
        <ToggleRow label="槓上開花 Win after kong" value={isAfterKong} onToggle={setIsAfterKong} colors={colors} />
        <ToggleRow label="搶槓 Robbing kong" value={isRobbingKong} onToggle={setIsRobbingKong} colors={colors} />

        <View style={styles.windRow}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>圈風 Round</Text>
          <View style={styles.windBtns}>
            {WIND_OPTIONS.map(({ wind, label }) => (
              <Pressable
                key={wind}
                onPress={() => setRoundWind(wind)}
                style={[styles.windBtn, roundWind === wind && { backgroundColor: colors.accent }]}
              >
                <Text style={[styles.windBtnText, roundWind === wind && { color: '#fff' }]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.windRow}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>門風 Seat</Text>
          <View style={styles.windBtns}>
            {WIND_OPTIONS.map(({ wind, label }) => (
              <Pressable
                key={wind}
                onPress={() => setSeatWind(wind)}
                style={[styles.windBtn, seatWind === wind && { backgroundColor: colors.accent }]}
              >
                <Text style={[styles.windBtnText, seatWind === wind && { color: '#fff' }]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {flowers.length > 0 && (
        <View style={[styles.flowersRow, { borderColor: colors.cardBorder }]}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>花牌 Flowers:</Text>
          {flowers.map((f, i) => (
            <Pressable
              key={i}
              onPress={() => setFlowers((prev) => prev.filter((_, j) => j !== i))}
              style={styles.flowerRemove}
            >
              <Text style={styles.flowerRemoveText}>
                {f.flower === FlowerType.Spring ? '春' :
                  f.flower === FlowerType.Summer ? '夏' :
                  f.flower === FlowerType.Autumn ? '秋' :
                  f.flower === FlowerType.Winter ? '冬' :
                  f.flower === FlowerType.Plum ? '梅' :
                  f.flower === FlowerType.Orchid ? '蘭' :
                  f.flower === FlowerType.Chrysanthemum ? '菊' : '竹'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.actionRow}>
        <Pressable onPress={doCalculate} style={[styles.calcBtn, { backgroundColor: colors.tint }]}>
          <Text style={styles.calcBtnText}>🧮 計算台數</Text>
        </Pressable>
        <Pressable onPress={clearAll} style={[styles.clearAllBtn, { borderColor: colors.cardBorder }]}>
          <Text style={[styles.clearAllText, { color: colors.subtitle }]}>清除</Text>
        </Pressable>
      </View>

      {result && (
        <View style={[styles.resultBox, { backgroundColor: colors.card, borderColor: colors.accent }]}>
          <Text style={[styles.resultTotal, { color: colors.accent }]}>
            {result.totalTai} 台
          </Text>
          {result.results.length === 0 && (
            <Text style={{ color: colors.subtitle }}>未達最低台數 (Below minimum tai)</Text>
          )}
          {result.results.map((r, i) => {
            const def = TAI_CATALOG_MAP[r.ruleId];
            return (
              <View key={i} style={styles.resultRow}>
                <Text style={[styles.resultTai, { color: colors.accent }]}>+{r.tai}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.resultName, { color: colors.text }]}>
                    {def?.name.zh ?? r.ruleId} {r.label ? `(${r.label})` : ''}
                  </Text>
                  <Text style={[styles.resultNameEn, { color: colors.subtitle }]}>
                    {def?.name.en ?? ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function ToggleRow({ label, value, onToggle, colors }: {
  label: string; value: boolean; onToggle: (v: boolean) => void; colors: any;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#ccc', true: colors.accent }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  meldRow: {
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meldLabel: { fontWeight: '700', fontSize: 14, width: 20 },
  meldTiles: { flexDirection: 'row', flex: 1, gap: 2 },
  typeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeBtnText: { fontSize: 12, fontWeight: '600' },
  clearBtn: { color: '#aa6666', fontSize: 16, paddingHorizontal: 4 },
  emptyTile: {
    width: 36,
    height: 48,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d4c9a8',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { color: '#aaa', fontSize: 18 },
  pickerBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 8,
  },
  contextBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: { fontSize: 14 },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
  },
  streakBtns: { flexDirection: 'row', gap: 4 },
  streakBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8e0d0',
  },
  streakBtnText: { fontSize: 14, fontWeight: '600', color: '#666' },
  windRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  windBtns: { flexDirection: 'row', gap: 4 },
  windBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e8e0d0',
  },
  windBtnText: { fontSize: 14, fontWeight: '600', color: '#666' },
  flowersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  flowerRemove: {
    backgroundColor: '#f8e8c8',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#d4c4a4',
  },
  flowerRemoveText: {
    fontSize: 14,
    color: '#8a6a2a',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  calcBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  calcBtnText: {
    color: '#f0e6d3',
    fontSize: 18,
    fontWeight: '700',
  },
  clearAllBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearAllText: { fontSize: 16 },
  resultBox: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginTop: 12,
    gap: 8,
  },
  resultTotal: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultTai: {
    fontSize: 16,
    fontWeight: '700',
    width: 36,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultNameEn: {
    fontSize: 12,
  },
});
