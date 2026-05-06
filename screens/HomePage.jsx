import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const stats = [
  { value: "4x", label: "Tumor classes in the pretrained model" },
  { value: "1", label: "Upload step from image to result" },
  { value: "FastAPI", label: "Backend serving model inference" },
];

const features = [
  {
    title: "Focus on the image",
    description: "Drop an MRI scan and let the model return the most likely tumor class.",
  },
  {
    title: "Confidence included",
    description: "See the predicted label with confidence and top alternatives.",
  },
  {
    title: "Modern stack",
    description: "Next.js frontend, FastAPI backend, Hugging Face model inference.",
  },
];

const repositoryMeta = {
  description: 'Brainic is an Expo React Native app for MRI brain tumor prediction and AI consultation.',
  website: 'https://github.com/umairimran/brainic',
  topics: 'expo react-native fastapi mri brain-tumor ai healthcare',
};

const includes = [
  {
    title: 'Releases',
    description: 'Track published versions and changelogs for each app update.',
  },
  {
    title: 'Deployments',
    description: 'View environment rollout status and deployment history.',
  },
  {
    title: 'Packages',
    description: 'Publish and manage reusable package artifacts.',
  },
];

export default function HomePage() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Brain Tumor Classification</Text>
          <Text style={styles.title}>
            Upload an MRI image and get an instant tumor type prediction.
          </Text>
          <Text style={styles.description}>
            A clean workflow for MRI classification powered by a pretrained vision model,
            delivered through a FastAPI backend and a polished interface.
          </Text>
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Predict')}
            >
              <Text style={styles.primaryButtonText}>Try the predictor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Consult')}
            >
              <Text style={styles.secondaryButtonText}>Consult AI Assistant</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.heroPanel}>
          <View style={[styles.panelCard, styles.panelCardLarge]}>
            <Text style={styles.panelLabel}>Model flow</Text>
            <View style={styles.panelSteps}>
              <Text style={styles.stepText}>Upload MRI</Text>
              <Text style={styles.stepText}>Backend preprocesses image</Text>
              <Text style={styles.stepText}>Model returns class and confidence</Text>
            </View>
          </View>
          <View style={[styles.panelCard, styles.panelCardAccent]}>
            <Text style={styles.panelLabel}>Output</Text>
            <Text style={styles.outputTitle}>Glioma Tumor</Text>
            <Text style={styles.outputDescription}>
              Confidence shown after inference with top ranked predictions.
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <View style={styles.statCard} key={item.label}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Features Grid */}
      <View style={styles.featureGrid}>
        {features.map((feature) => (
          <View style={styles.featureCard} key={feature.title}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.repoMetaSection}>
        <Text style={styles.sectionHeading}>Repository Details</Text>
        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>Description</Text>
          <Text style={styles.metaValue}>{repositoryMeta.description}</Text>
        </View>
        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>Website</Text>
          <Text style={styles.metaValue}>{repositoryMeta.website}</Text>
        </View>
        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>Topics (separate with spaces)</Text>
          <Text style={styles.metaValue}>{repositoryMeta.topics}</Text>
        </View>
      </View>

      <View style={styles.includesSection}>
        <Text style={styles.sectionHeading}>Include In The Home Page</Text>
        {includes.map((item) => (
          <View style={styles.includeCard} key={item.title}>
            <Text style={styles.includeTitle}>{item.title}</Text>
            <Text style={styles.includeDescription}>{item.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  hero: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  heroCopy: {
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 36,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    flex: 1,
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
  },
  heroPanel: {
    marginTop: 8,
    gap: 12,
  },
  panelCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  panelCardLarge: {
    backgroundColor: '#ffffff',
  },
  panelCardAccent: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  panelSteps: {
    gap: 8,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
  },
  outputTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  outputDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  featureGrid: {
    padding: 20,
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  repoMetaSection: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 10,
  },
  metaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  metaValue: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  includesSection: {
    padding: 20,
    paddingTop: 12,
    gap: 10,
  },
  includeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
  },
  includeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  includeDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});