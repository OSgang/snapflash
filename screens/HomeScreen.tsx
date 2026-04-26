import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';

type Deck = {
  id: string;
  title: string;
  words: number;
  learned: number;
  lastAccessed: string;
};

type BottomNavItem = {
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  active?: boolean;
};

const decks: Deck[] = [
  { id: 'houses', title: 'Houses', words: 20, learned: 4, lastAccessed: '20 minutes ago' },
  { id: 'economics', title: 'Economics', words: 5, learned: 5, lastAccessed: '45 minutes ago' },
  { id: 'health', title: 'Health', words: 10, learned: 3, lastAccessed: '90 minutes ago' },
  { id: 'my-words', title: 'My Words', words: 50, learned: 45, lastAccessed: '2 hours ago' },
];

const bottomNavItems: BottomNavItem[] = [
  { label: 'Home', icon: 'home', active: true },
  { label: 'Collections', icon: 'filter-vintage' },
  { label: 'Insights', icon: 'insert-chart-outlined' },
  { label: 'Settings', icon: 'settings' },
];

export default function HomeScreen() {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState(decks[0].id);
  const [selectedNavLabel, setSelectedNavLabel] = useState(bottomNavItems[0].label);

  function handleToggleActions(event?: GestureResponderEvent) {
    event?.preventDefault();
    setActionsOpen((current) => !current);
  }

  function handleQuickAction() {
    setActionsOpen(false);
  }

  function handleDeckPress(deck: Deck) {
    setSelectedDeckId(deck.id);
  }

  function handleNavPress(item: BottomNavItem) {
    setSelectedNavLabel(item.label);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          testID="home-scroll-view">
          <Text style={styles.appName}>SnapFlash</Text>

          <Text style={styles.sectionLabel}>Overview</Text>
          <View style={styles.overviewRow}>
            <View style={[styles.metricCard, styles.studiedCard]}>
              <Text style={styles.metricTitle}>Studied</Text>
              <Text style={styles.metricValue}>25</Text>
              <Text style={styles.metricCaption}>cards in today</Text>
            </View>
            <View style={[styles.metricCard, styles.reviewedCard]}>
              <Text style={styles.metricTitle}>Reviewed</Text>
              <Text style={styles.metricValue}>1</Text>
              <Text style={styles.metricCaption}>cards in today</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Last Accessed</Text>
          <View style={styles.deckList}>
            {decks.map((deck) => (
              <Pressable
                accessibilityLabel={`Open ${deck.title} deck`}
                accessibilityRole="button"
                accessibilityState={{ selected: deck.id === selectedDeckId }}
                key={deck.id}
                onPress={() => handleDeckPress(deck)}
                style={({ pressed }) => [
                  styles.deckCard,
                  deck.id === selectedDeckId ? styles.selectedDeckCard : undefined,
                  pressed ? styles.pressed : undefined,
                ]}>
                <View style={styles.deckHeader}>
                  <Text style={styles.deckTitle}>{deck.title}</Text>
                  <MaterialIcons name="chevron-right" size={22} color={colors.mutedText} />
                </View>
                <View style={styles.badgeRow}>
                  <InfoBadge backgroundColor="#B7E4FF" color="#145D94" label={`${deck.words} words`} />
                  <InfoBadge
                    backgroundColor="#FFD7DA"
                    color="#974047"
                    label={`${deck.learned} learned`}
                  />
                  <InfoBadge
                    backgroundColor="#D8FBCB"
                    color="#35732E"
                    label={deck.lastAccessed}
                    wide
                  />
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {actionsOpen ? (
          <View accessibilityLabel="Quick actions" style={styles.quickActions}>
            <Pressable
              accessibilityLabel="Scan documents"
              accessibilityRole="button"
              onPress={handleQuickAction}
              style={({ pressed }) => [styles.quickActionButton, pressed ? styles.pressed : undefined]}>
              <MaterialIcons name="document-scanner" size={24} color={colors.white} />
            </Pressable>
            <Pressable
              accessibilityLabel="Create flashcard"
              accessibilityRole="button"
              onPress={handleQuickAction}
              style={({ pressed }) => [styles.quickActionButton, pressed ? styles.pressed : undefined]}>
              <MaterialIcons name="style" size={24} color={colors.white} />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.bottomBar}>
          {bottomNavItems.map((item, index) => (
            <Pressable
              accessibilityLabel={`${item.label} tab`}
              accessibilityRole="button"
              accessibilityState={{ selected: item.label === selectedNavLabel }}
              key={item.label}
              onPress={() => handleNavPress(item)}
              style={[styles.navItem, index === 2 ? styles.navAfterFab : undefined]}>
              {item.label === selectedNavLabel ? <View style={styles.navActivePill} /> : null}
              <MaterialIcons
                name={item.icon}
                size={22}
                color={item.label === selectedNavLabel ? colors.active : colors.inactive}
              />
              <Text
                style={[
                  styles.navLabel,
                  item.label === selectedNavLabel ? styles.navLabelActive : undefined,
                ]}>
                {item.label}
              </Text>
            </Pressable>
          ))}

          <Pressable
            accessibilityLabel={actionsOpen ? 'Close quick actions' : 'Open quick actions'}
            accessibilityRole="button"
            accessibilityState={{ expanded: actionsOpen }}
            onPress={handleToggleActions}
            style={({ pressed }) => [styles.fab, pressed ? styles.pressed : undefined]}>
            <MaterialIcons name={actionsOpen ? 'close' : 'add'} size={28} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function InfoBadge({
  backgroundColor,
  color,
  label,
  wide,
}: {
  backgroundColor: string;
  color: string;
  label: string;
  wide?: boolean;
}) {
  return (
    <View style={[styles.badge, { backgroundColor }, wide ? styles.wideBadge : undefined]}>
      <Text numberOfLines={1} style={[styles.badgeText, { color }]}>
        {label}
      </Text>
    </View>
  );
}

const colors = {
  background: '#F7FCFF',
  surface: '#FFFFFF',
  softBlue: '#E4F5FF',
  border: '#B7C8D6',
  ink: '#101114',
  mutedText: '#5F6974',
  active: '#169CFF',
  inactive: '#AEB5BC',
  studied: '#6F9DFF',
  reviewed: '#FF9D7D',
  fab: '#16A9FF',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 412,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 132,
  },
  appName: {
    color: colors.ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: 0,
  },
  sectionLabel: {
    marginTop: 28,
    color: colors.ink,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    letterSpacing: 0,
  },
  overviewRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minHeight: 64,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  studiedCard: {
    backgroundColor: colors.studied,
  },
  reviewedCard: {
    backgroundColor: colors.reviewed,
  },
  metricTitle: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0,
  },
  metricValue: {
    color: colors.white,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    letterSpacing: 0,
  },
  metricCaption: {
    color: colors.white,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0,
  },
  sectionTitle: {
    marginTop: 30,
    color: colors.ink,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '800',
    letterSpacing: 0,
  },
  deckList: {
    marginTop: 14,
    gap: 15,
  },
  deckCard: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  selectedDeckCard: {
    borderColor: colors.active,
    borderWidth: 2,
    backgroundColor: '#EEF8FF',
  },
  deckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deckTitle: {
    color: colors.ink,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '800',
    letterSpacing: 0,
  },
  badgeRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    minWidth: 68,
    maxWidth: 92,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  wideBadge: {
    minWidth: 110,
    maxWidth: 130,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0,
  },
  quickActions: {
    position: 'absolute',
    bottom: 94,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 72,
  },
  quickActionButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: colors.active,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 92,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D4DFE8',
    paddingHorizontal: 4,
    paddingTop: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    width: '20%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative',
  },
  navAfterFab: {
    marginLeft: '20%',
  },
  navLabel: {
    color: colors.inactive,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 0,
  },
  navLabelActive: {
    color: colors.active,
  },
  navActivePill: {
    position: 'absolute',
    top: 0,
    width: 34,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.active,
  },
  fab: {
    position: 'absolute',
    left: '50%',
    top: -20,
    marginLeft: -26,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: colors.fab,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 8,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
