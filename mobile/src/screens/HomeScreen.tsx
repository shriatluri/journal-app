import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, Text, Card, Chip, IconButton } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useJournal } from '../context/JournalContext';
import { useAuth } from '../context/AuthContext';
import { JournalEntry } from '../types';
import { colors } from '../constants/colors';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { entries, isLoading, fetchEntries, refreshEntries, totalEntries } = useJournal();
  const { logout } = useAuth();

  useEffect(() => {
    fetchEntries();
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="logout"
          iconColor={colors.white}
          onPress={logout}
        />
      ),
    });
  }, [navigation, logout]);

  const renderEntry = ({ item }: { item: JournalEntry }) => {
    const date = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const sentimentColor = colors.sentiment[item.growthNote?.overallSentiment || 'neutral'];

    return (
      <Card
        style={styles.card}
        onPress={() => navigation.navigate('GrowthNote', { entryId: item.id })}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="labelLarge">{date}</Text>
            <View style={[styles.sentimentDot, { backgroundColor: sentimentColor }]} />
          </View>

          <Text variant="bodyMedium" numberOfLines={2} style={styles.preview}>
            {item.rawText}
          </Text>

          {item.growthNote?.detectedAreas?.length > 0 && (
            <View style={styles.areasContainer}>
              {item.growthNote.detectedAreas.slice(0, 3).map((area) => (
                <Chip
                  key={area.areaName}
                  compact
                  style={[
                    styles.areaChip,
                    { backgroundColor: colors.progress[area.progressIndicator] + '20' },
                  ]}
                  textStyle={{ fontSize: 11 }}
                >
                  {area.areaName}
                </Chip>
              ))}
            </View>
          )}

          {item.growthNote?.actionableInsight && (
            <Text variant="bodySmall" style={styles.insight} numberOfLines={1}>
              {item.growthNote.actionableInsight}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        Ready to start tracking your growth?
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        Tap the + button to write your first journal entry
      </Text>
    </View>
  );

  const loadMore = () => {
    if (entries.length < totalEntries && !isLoading) {
      fetchEntries(10, entries.length);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshEntries} />
        }
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('NewEntry')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sentimentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  preview: {
    color: colors.gray[700],
    marginBottom: 12,
  },
  areasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  areaChip: {
    height: 24,
  },
  insight: {
    color: colors.primary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    color: colors.gray[600],
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});
