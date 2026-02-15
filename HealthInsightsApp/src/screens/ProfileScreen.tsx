import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useColorScheme,
} from 'react-native';

export function ProfileScreen() {
  const isDark = useColorScheme() === 'dark';

  const [pregnant, setPregnant] = useState<'yes' | 'no' | null>(null);
  const [pregnancyWeeks, setPregnancyWeeks] = useState('');
  const [breastfeeding, setBreastfeeding] = useState<'yes' | 'no' | null>(null);
  const [breastfeedingDuration, setBreastfeedingDuration] = useState('');

  return (
    <ScrollView
      style={[styles.container, isDark && styles.bgDark]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, isDark && styles.textDark]}>Profile</Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
        Health information for personalized insights
      </Text>

      {/* Pregnancy */}
      <View style={[styles.section, isDark && styles.cardDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          Are you pregnant?
        </Text>
        <View style={styles.yesNoRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              pregnant === 'yes' && styles.optionSelected,
              isDark && pregnant === 'yes' && styles.optionSelectedDark,
            ]}
            onPress={() => setPregnant('yes')}
          >
            <Text
              style={[
                styles.optionText,
                isDark && styles.textDark,
                pregnant === 'yes' && styles.optionTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              pregnant === 'no' && styles.optionSelected,
              isDark && pregnant === 'no' && styles.optionSelectedDark,
            ]}
            onPress={() => {
              setPregnant('no');
              setPregnancyWeeks('');
            }}
          >
            <Text
              style={[
                styles.optionText,
                isDark && styles.textDark,
                pregnant === 'no' && styles.optionTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
        {pregnant === 'yes' && (
          <View style={styles.howLongRow}>
            <Text style={[styles.howLongLabel, isDark && styles.textDark]}>
              How long? (weeks)
            </Text>
            <TextInput
              style={[
                styles.input,
                isDark && styles.inputDark,
              ]}
              value={pregnancyWeeks}
              onChangeText={setPregnancyWeeks}
              placeholder="e.g. 12"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>
        )}
      </View>

      {/* Breastfeeding */}
      <View style={[styles.section, isDark && styles.cardDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          Are you breastfeeding?
        </Text>
        <View style={styles.yesNoRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              breastfeeding === 'yes' && styles.optionSelected,
              isDark && breastfeeding === 'yes' && styles.optionSelectedDark,
            ]}
            onPress={() => setBreastfeeding('yes')}
          >
            <Text
              style={[
                styles.optionText,
                isDark && styles.textDark,
                breastfeeding === 'yes' && styles.optionTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              breastfeeding === 'no' && styles.optionSelected,
              isDark && breastfeeding === 'no' && styles.optionSelectedDark,
            ]}
            onPress={() => {
              setBreastfeeding('no');
              setBreastfeedingDuration('');
            }}
          >
            <Text
              style={[
                styles.optionText,
                isDark && styles.textDark,
                breastfeeding === 'no' && styles.optionTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
        {breastfeeding === 'yes' && (
          <View style={styles.howLongRow}>
            <Text style={[styles.howLongLabel, isDark && styles.textDark]}>
              How long? (weeks or months)
            </Text>
            <TextInput
              style={[
                styles.input,
                isDark && styles.inputDark,
              ]}
              value={breastfeedingDuration}
              onChangeText={setBreastfeedingDuration}
              placeholder="e.g. 3 months"
              placeholderTextColor={isDark ? '#8e8e93' : '#999'}
              keyboardType="default"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bgDark: {
    backgroundColor: '#1c1c1e',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
  },
  subtitleDark: {
    color: '#8e8e93',
  },
  textDark: {
    color: '#e5e5ea',
  },
  section: {
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardDark: {
    backgroundColor: '#2c2c2e',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  yesNoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    borderColor: '#007AFF',
  },
  optionSelectedDark: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    borderColor: '#0a84ff',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  optionTextSelected: {
    color: '#007AFF',
  },
  howLongRow: {
    marginTop: 16,
  },
  howLongLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#c7c7cc',
  },
  inputDark: {
    backgroundColor: '#3a3a3c',
    color: '#e5e5ea',
    borderColor: '#48484a',
  },
});
