import React, { useState, useMemo } from 'react';
import {
  StyleSheet, FlatList, Pressable, TextInput,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { TAI_CATALOG, TaiRuleDef, TaiRuleId } from '@/src/data/tai-catalog';
import { TAI_EXAMPLES } from '@/src/data/tai-examples';
import TileDisplay from '@/components/TileDisplay';

type Category = 'all' | TaiRuleDef['category'];

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'basic', label: '基本' },
  { key: 'wind', label: '風牌' },
  { key: 'dragon', label: '三元' },
  { key: 'flower', label: '花牌' },
  { key: 'flush', label: '一色' },
  { key: 'pattern', label: '牌型' },
  { key: 'terminal', label: '么九' },
  { key: 'special', label: '特殊' },
];

const CATEGORY_COLORS: Record<string, string> = {
  basic: '#6b8a6b',
  wind: '#4a7a9a',
  dragon: '#9a4a4a',
  flower: '#9a7a4a',
  flush: '#6a5a9a',
  pattern: '#5a8a7a',
  terminal: '#7a6a4a',
  special: '#8a5a7a',
};

function taiLabel(tai: number): string {
  if (tai === -1) return '可變';
  if (tai === 0) return '自動胡';
  return `${tai} 台`;
}

export default function ReferenceScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [category, setCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let rules = TAI_CATALOG;
    if (category !== 'all') {
      rules = rules.filter((r) => r.category === category);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rules = rules.filter(
        (r) =>
          r.name.zh.includes(q) ||
          r.name.en.toLowerCase().includes(q) ||
          r.description.zh.includes(q) ||
          r.description.en.toLowerCase().includes(q),
      );
    }
    return rules;
  }, [category, search]);

  const renderRule = ({ item }: { item: TaiRuleDef }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.taiBadge, { backgroundColor: colors.accent }]}>
          <Text style={styles.taiBadgeText}>{taiLabel(item.tai)}</Text>
        </View>
        <View style={[styles.catBadge, { backgroundColor: CATEGORY_COLORS[item.category] + '22' }]}>
          <Text style={[styles.catBadgeText, { color: CATEGORY_COLORS[item.category] }]}>
            {CATEGORIES.find((c) => c.key === item.category)?.label}
          </Text>
        </View>
        {item.stackable && (
          <View style={styles.stackBadge}>
            <Text style={styles.stackText}>可疊加</Text>
          </View>
        )}
      </View>
      <Text style={[styles.ruleName, { color: colors.text }]}>{item.name.zh}</Text>
      <Text style={[styles.ruleNameEn, { color: colors.accent }]}>{item.name.en}</Text>
      <Text style={[styles.ruleDesc, { color: colors.subtitle }]}>{item.description.zh}</Text>
      <Text style={[styles.ruleDescEn, { color: colors.subtitle }]}>{item.description.en}</Text>
      {item.excludes.length > 0 && (
        <Text style={styles.excludes}>
          排除: {item.excludes.map((e) => TAI_CATALOG.find((r) => r.id === e)?.name.zh).filter(Boolean).join('、')}
        </Text>
      )}

      {/* Example tiles */}
      {TAI_EXAMPLES[item.id as TaiRuleId] && (
        <View style={styles.exampleContainer}>
          <Text style={[styles.exampleTitle, { color: colors.accent }]}>示範 Example</Text>
          <View style={styles.exampleTiles}>
            {TAI_EXAMPLES[item.id as TaiRuleId]!.tiles.map((group, gi) => (
              <View key={gi} style={styles.tileGroup}>
                {group.map((tile, ti) => (
                  <TileDisplay key={ti} tile={tile} size="sm" />
                ))}
              </View>
            ))}
          </View>
          {TAI_EXAMPLES[item.id as TaiRuleId]!.label && (
            <Text style={[styles.exampleLabel, { color: colors.subtitle }]}>
              {TAI_EXAMPLES[item.id as TaiRuleId]!.label}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        style={[styles.search, {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          color: colors.text,
        }]}
        placeholder="搜尋台數規則... Search rules..."
        placeholderTextColor={colors.subtitle}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.key}
            onPress={() => setCategory(c.key)}
            style={[
              styles.chip,
              {
                backgroundColor: category === c.key ? colors.tint : colors.card,
                borderColor: category === c.key ? colors.tint : colors.cardBorder,
              },
            ]}
          >
            <Text style={[
              styles.chipText,
              { color: category === c.key ? '#f0e6d3' : colors.text },
            ]}>
              {c.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.count, { color: colors.subtitle }]}>
        {filtered.length} 條規則
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderRule}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  count: {
    paddingHorizontal: 16,
    marginBottom: 4,
    fontSize: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  taiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  taiBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  catBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stackBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#e8d8a822',
  },
  stackText: {
    fontSize: 11,
    color: '#8a7a4a',
    fontWeight: '600',
  },
  ruleName: {
    fontSize: 20,
    fontWeight: '700',
  },
  ruleNameEn: {
    fontSize: 14,
    fontWeight: '600',
  },
  ruleDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  ruleDescEn: {
    fontSize: 12,
    lineHeight: 18,
  },
  excludes: {
    fontSize: 11,
    color: '#aa6666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  exampleContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.15)',
  },
  exampleTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  exampleTiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  tileGroup: {
    flexDirection: 'row',
    gap: 1,
    backgroundColor: 'rgba(128,128,128,0.06)',
    borderRadius: 4,
    padding: 2,
  },
  exampleLabel: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
