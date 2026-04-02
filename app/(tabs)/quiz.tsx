import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet, Pressable, ScrollView, ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import HandDisplay from '@/components/HandDisplay';
import { QUIZ_SCENARIOS } from '@/src/data/quiz-hands';
import { calculateScore, ScoreBreakdown } from '@/src/engine/scoring';
import { TAI_CATALOG_MAP } from '@/src/data/tai-catalog';
import { generateOneQuiz, GeneratedQuiz } from '@/src/engine/random-hand-generator';
import { Hand } from '@/src/engine/hand';
import { GameContext } from '@/src/engine/scoring/context';

type Difficulty = 'easy' | 'medium' | 'hard';
type QuizMode = 'random' | 'curated';

interface ActiveQuiz {
  hand: Hand;
  context: Partial<GameContext>;
  expectedTai: number;
  breakdown: ScoreBreakdown;
  hintZh?: string;
  hintEn?: string;
}

function generateChoices(correct: number): number[] {
  const choices = new Set<number>([correct]);
  const candidates = [
    Math.max(0, correct - 3),
    Math.max(0, correct - 2),
    Math.max(0, correct - 1),
    correct + 1,
    correct + 2,
    correct + 3,
    Math.max(1, Math.floor(correct * 0.6)),
    Math.ceil(correct * 1.5),
  ].filter((n) => n !== correct && n >= 0);

  while (choices.size < 4 && candidates.length > 0) {
    const idx = Math.floor(Math.random() * candidates.length);
    choices.add(candidates.splice(idx, 1)[0]);
  }
  while (choices.size < 4) {
    choices.add(Math.floor(Math.random() * Math.max(20, correct + 10)));
  }
  return Array.from(choices).sort((a, b) => a - b);
}

/** Build a random quiz matching a given difficulty. Retries internally. */
function generateRandomForDifficulty(diff: Difficulty): GeneratedQuiz | null {
  for (let i = 0; i < 60; i++) {
    const q = generateOneQuiz();
    if (q && q.difficulty === diff) return q;
  }
  // Fallback: accept any
  for (let i = 0; i < 20; i++) {
    const q = generateOneQuiz();
    if (q) return q;
  }
  return null;
}

export default function QuizScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [mode, setMode] = useState<QuizMode>('random');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [questionNum, setQuestionNum] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);

  // Curated scenario index
  const curatedIdx = useRef(0);
  const curatedScenarios = useMemo(
    () => QUIZ_SCENARIOS.filter((s) => s.difficulty === difficulty),
    [difficulty],
  );

  const loadNextQuiz = useCallback(() => {
    setLoading(true);
    setSelected(null);
    setShowHint(false);

    if (mode === 'curated') {
      const s = curatedScenarios[curatedIdx.current % curatedScenarios.length];
      curatedIdx.current++;
      const breakdown = calculateScore(s.hand, s.context);
      setActiveQuiz({
        hand: s.hand,
        context: s.context,
        expectedTai: s.expectedTai,
        breakdown,
        hintZh: s.hintZh,
        hintEn: s.hintEn,
      });
      setLoading(false);
    } else {
      // Defer to next frame so UI can show loading
      setTimeout(() => {
        const q = generateRandomForDifficulty(difficulty);
        if (q) {
          setActiveQuiz({
            hand: q.hand,
            context: q.context,
            expectedTai: q.breakdown.totalTai,
            breakdown: q.breakdown,
          });
        }
        setLoading(false);
      }, 50);
    }
  }, [mode, difficulty, curatedScenarios]);

  // Load first quiz
  useEffect(() => {
    loadNextQuiz();
  }, [mode, difficulty]);

  const choices = useMemo(
    () => activeQuiz ? generateChoices(activeQuiz.expectedTai) : [],
    [activeQuiz],
  );

  const handleSelect = useCallback(
    (choice: number) => {
      if (selected !== null || !activeQuiz) return;
      setSelected(choice);
      setScore((prev) => ({
        correct: prev.correct + (choice === activeQuiz.expectedTai ? 1 : 0),
        total: prev.total + 1,
      }));
    },
    [selected, activeQuiz],
  );

  const handleNext = () => {
    setQuestionNum((n) => n + 1);
    loadNextQuiz();
  };

  const handleChangeDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    setQuestionNum(1);
    curatedIdx.current = 0;
    setScore({ correct: 0, total: 0 });
  };

  const handleChangeMode = (m: QuizMode) => {
    setMode(m);
    setQuestionNum(1);
    curatedIdx.current = 0;
    setScore({ correct: 0, total: 0 });
  };

  const DIFFICULTIES: { key: Difficulty; label: string }[] = [
    { key: 'easy', label: '初級' },
    { key: 'medium', label: '中級' },
    { key: 'hard', label: '高級' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Mode toggle */}
      <View style={styles.modeRow}>
        <Pressable
          onPress={() => handleChangeMode('random')}
          style={[styles.modeBtn, {
            backgroundColor: mode === 'random' ? colors.tint : colors.card,
            borderColor: mode === 'random' ? colors.tint : colors.cardBorder,
          }]}
        >
          <Text style={[styles.modeText, { color: mode === 'random' ? '#f0e6d3' : colors.text }]}>
            🎲 隨機 Random
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleChangeMode('curated')}
          style={[styles.modeBtn, {
            backgroundColor: mode === 'curated' ? colors.tint : colors.card,
            borderColor: mode === 'curated' ? colors.tint : colors.cardBorder,
          }]}
        >
          <Text style={[styles.modeText, { color: mode === 'curated' ? '#f0e6d3' : colors.text }]}>
            📋 精選 Curated
          </Text>
        </Pressable>
      </View>

      {/* Difficulty + Score */}
      <View style={styles.diffRow}>
        {DIFFICULTIES.map((d) => (
          <Pressable
            key={d.key}
            onPress={() => handleChangeDifficulty(d.key)}
            style={[
              styles.diffBtn,
              {
                backgroundColor: difficulty === d.key ? colors.tint : colors.card,
                borderColor: difficulty === d.key ? colors.tint : colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.diffText, { color: difficulty === d.key ? '#f0e6d3' : colors.text }]}>
              {d.label}
            </Text>
          </Pressable>
        ))}
        <View style={[styles.scoreBadge, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.scoreText, { color: colors.accent }]}>
            {score.correct}/{score.total}
          </Text>
        </View>
      </View>

      {loading || !activeQuiz ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={{ color: colors.subtitle, marginTop: 8 }}>出題中…</Text>
        </View>
      ) : (
        <>
          <View style={styles.questionNum}>
            <Text style={[styles.questionNumText, { color: colors.subtitle }]}>
              第 {questionNum} 題
              {mode === 'curated' && ` / ${curatedScenarios.length}`}
              {mode === 'random' && ' (∞)'}
            </Text>
          </View>

          <View style={[styles.handBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <HandDisplay hand={activeQuiz.hand} flowers={activeQuiz.context.flowers} size="sm" />
            <View style={styles.contextTags}>
              {activeQuiz.context.isSelfDraw && <Tag text="自摸" color="#4a8a5a" />}
              {activeQuiz.context.isDealer && <Tag text="莊家" color="#8a6a4a" />}
              {activeQuiz.context.roundWind && (
                <Tag
                  text={`圈風: ${{ east: '東', south: '南', west: '西', north: '北' }[activeQuiz.context.roundWind]}`}
                  color="#4a7a9a"
                />
              )}
              {activeQuiz.context.seatWind && (
                <Tag
                  text={`門風: ${{ east: '東', south: '南', west: '西', north: '北' }[activeQuiz.context.seatWind]}`}
                  color="#4a7a9a"
                />
              )}
              {(activeQuiz.context.dealerStreak ?? 0) > 0 && (
                <Tag text={`連${activeQuiz.context.dealerStreak}`} color="#9a6a4a" />
              )}
              {activeQuiz.context.isReady && <Tag text="聽牌" color="#7a4a9a" />}
              {activeQuiz.context.isDoublePongWait && <Tag text="對碰" color="#7a4a9a" />}
              {activeQuiz.hand.isSingleWait && <Tag text="獨聽" color="#9a4a6a" />}
              {activeQuiz.context.isLastTileSelfDraw && <Tag text="海底撈月" color="#4a6a9a" />}
              {activeQuiz.context.isLastDiscard && <Tag text="河底撈魚" color="#4a6a9a" />}
              {activeQuiz.context.isAfterKong && <Tag text="槓上開花" color="#6a8a4a" />}
              {activeQuiz.context.isRobbingKong && <Tag text="搶槓" color="#6a8a4a" />}
              {activeQuiz.context.isKongOnKong && <Tag text="摃上摃" color="#9a6a4a" />}
              {activeQuiz.context.isHeavenlyHand && <Tag text="天胡" color="#aa4444" />}
              {activeQuiz.context.isEarthlyHand && <Tag text="地胡" color="#aa4444" />}
              {activeQuiz.context.isHumanHand && <Tag text="人胡" color="#aa4444" />}
            </View>
          </View>

          <Text style={[styles.prompt, { color: colors.text }]}>這手牌幾台？</Text>
          <Text style={[styles.promptEn, { color: colors.subtitle }]}>How many tai is this hand?</Text>

          <View style={styles.choices}>
            {choices.map((c) => {
              const isCorrect = c === activeQuiz.expectedTai;
              const isSelected = selected === c;
              let bgColor = colors.card;
              let borderCol = colors.cardBorder;
              if (selected !== null) {
                if (isCorrect) {
                  bgColor = '#2a7a3a22';
                  borderCol = '#2a7a3a';
                } else if (isSelected) {
                  bgColor = '#aa333322';
                  borderCol = '#aa3333';
                }
              }
              return (
                <Pressable
                  key={c}
                  onPress={() => handleSelect(c)}
                  style={[styles.choiceBtn, { backgroundColor: bgColor, borderColor: borderCol }]}
                >
                  <Text style={[styles.choiceText, { color: colors.text }]}>{c} 台</Text>
                </Pressable>
              );
            })}
          </View>

          {selected === null && activeQuiz.hintZh && (
            <Pressable onPress={() => setShowHint(true)} style={styles.hintBtn}>
              <Text style={[styles.hintBtnText, { color: colors.accent }]}>
                {showHint ? '' : '💡 提示 Hint'}
              </Text>
            </Pressable>
          )}

          {showHint && selected === null && activeQuiz.hintZh && (
            <View style={[styles.hintBox, { backgroundColor: colors.card, borderColor: colors.accent }]}>
              <Text style={{ color: colors.text }}>{activeQuiz.hintZh}</Text>
              <Text style={{ color: colors.subtitle, fontSize: 12 }}>{activeQuiz.hintEn}</Text>
            </View>
          )}

          {selected !== null && (
            <View style={[styles.breakdownBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.breakdownTitle, { color: selected === activeQuiz.expectedTai ? '#2a7a3a' : '#aa3333' }]}>
                {selected === activeQuiz.expectedTai ? '✅ 正確！' : `❌ 答案是 ${activeQuiz.expectedTai} 台`}
              </Text>
              <Text style={[styles.breakdownSubtitle, { color: colors.subtitle }]}>台數明細：</Text>
              {activeQuiz.breakdown.results.map((r, i) => {
                const def = TAI_CATALOG_MAP[r.ruleId];
                return (
                  <View key={i} style={styles.breakdownRow}>
                    <Text style={[styles.breakdownTai, { color: colors.accent }]}>+{r.tai}</Text>
                    <Text style={{ color: colors.text, flex: 1 }}>
                      {def?.name.zh ?? r.ruleId} {r.label ? `(${r.label})` : ''}
                    </Text>
                  </View>
                );
              })}
              <Pressable onPress={handleNext} style={[styles.nextBtn, { backgroundColor: colors.tint }]}>
                <Text style={styles.nextBtnText}>下一題 Next →</Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function Tag({ text, color }: { text: string; color: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.tagText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeText: { fontSize: 14, fontWeight: '600' },
  loadingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  diffRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  diffBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  diffText: { fontSize: 14, fontWeight: '600' },
  scoreBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  scoreText: { fontSize: 16, fontWeight: '700' },
  questionNum: { alignItems: 'center' },
  questionNumText: { fontSize: 13 },
  handBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  contextTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: { fontSize: 11, fontWeight: '600' },
  prompt: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  promptEn: { fontSize: 14, textAlign: 'center' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  choiceBtn: {
    width: '45%',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  choiceText: { fontSize: 20, fontWeight: '700' },
  hintBtn: { alignItems: 'center', paddingVertical: 8 },
  hintBtnText: { fontSize: 14 },
  hintBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 2,
  },
  breakdownBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  breakdownTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  breakdownSubtitle: { fontSize: 13, marginTop: 4 },
  breakdownRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  breakdownTai: { fontSize: 14, fontWeight: '700', width: 32 },
  nextBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextBtnText: { color: '#f0e6d3', fontSize: 16, fontWeight: '700' },
});
