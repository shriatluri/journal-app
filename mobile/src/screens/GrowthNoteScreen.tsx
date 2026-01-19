import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { journalService } from '../services/journalService';
import { JournalEntry } from '../types';
import { colors } from '../constants/colors';

type GrowthNoteScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GrowthNote'>;
  route: RouteProp<RootStackParamList, 'GrowthNote'>;
};

export default function GrowthNoteScreen({ navigation, route }: GrowthNoteScreenProps) {
  const { entryId } = route.params;
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntry = async () => {
      try {
        const data = await journalService.getEntry(entryId);
        setEntry(data);
      } catch (error) {
        console.error('Failed to load entry:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntry();
  }, [entryId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="bodyLarge">Entry not found</Text>
      </View>
    );
  }

  const { growthNote } = entry;
  const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const sentimentColor = colors.sentiment[growthNote?.overallSentiment || 'neutral'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.mainCard}>
          <Card.Content>
            <View style={styles.header}>
              <Text variant="titleMedium">{date}</Text>
              <Chip
                compact
                style={{ backgroundColor: sentimentColor + '30' }}
                textStyle={{ color: sentimentColor }}
              >
                {growthNote?.overallSentiment || 'neutral'}
              </Chip>
            </View>

            {growthNote?.detectedAreas && growthNote.detectedAreas.length > 0 ? (
              <View style={styles.section}>
                <Text variant="labelLarge" style={styles.sectionTitle}>
                  Growth Areas Detected
                </Text>
                {growthNote.detectedAreas.map((area, index) => (
                  <Card key={index} style={styles.areaCard}>
                    <Card.Content>
                      <View style={styles.areaHeader}>
                        <Text variant="titleSmall">{area.areaName}</Text>
                        <Chip
                          compact
                          style={{
                            backgroundColor:
                              colors.progress[area.progressIndicator] + '20',
                          }}
                          textStyle={{
                            color: colors.progress[area.progressIndicator],
                            fontSize: 11,
                          }}
                        >
                          {area.progressIndicator.replace('_', ' ')}
                        </Chip>
                      </View>
                      <Text
                        variant="bodyMedium"
                        style={styles.evidence}
                      >
                        "{area.evidenceSnippet}"
                      </Text>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            ) : null}

            {growthNote?.keyMoments && growthNote.keyMoments.length > 0 ? (
              <View style={styles.section}>
                <Text variant="labelLarge" style={styles.sectionTitle}>
                  Key Moments
                </Text>
                {growthNote.keyMoments.map((moment, index) => (
                  <View key={index} style={styles.momentItem}>
                    <Text variant="bodyMedium">• {moment}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {growthNote?.actionableInsight ? (
              <View style={styles.insightSection}>
                <Text variant="labelLarge" style={styles.sectionTitle}>
                  Actionable Insight
                </Text>
                <Card style={styles.insightCard}>
                  <Card.Content>
                    <Text variant="bodyMedium" style={styles.insightText}>
                      {growthNote.actionableInsight}
                    </Text>
                  </Card.Content>
                </Card>
              </View>
            ) : null}
          </Card.Content>
        </Card>

        <Card style={styles.originalCard}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.sectionTitle}>
              Original Entry
            </Text>
            <Text variant="bodyMedium" style={styles.originalText}>
              {entry.rawText}
            </Text>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('Home')}
          style={styles.doneButton}
        >
          Done
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCard: {
    backgroundColor: colors.white,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.gray[600],
    marginBottom: 12,
  },
  areaCard: {
    backgroundColor: colors.gray[100],
    marginBottom: 8,
  },
  areaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  evidence: {
    fontStyle: 'italic',
    color: colors.gray[700],
  },
  momentItem: {
    marginBottom: 8,
  },
  insightSection: {
    marginBottom: 8,
  },
  insightCard: {
    backgroundColor: colors.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  insightText: {
    color: colors.primary,
  },
  originalCard: {
    backgroundColor: colors.white,
    marginBottom: 16,
  },
  originalText: {
    color: colors.gray[600],
  },
  doneButton: {
    marginBottom: 24,
  },
});
