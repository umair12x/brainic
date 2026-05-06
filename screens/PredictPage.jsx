import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';

const resolveApiBaseUrl = () => {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  const extra1 = Constants?.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL;
  const extra2 = Constants?.manifest?.extra?.EXPO_PUBLIC_API_BASE_URL;
  const configured = env || extra1 || extra2;
  if (configured) return configured;
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  if (Platform.OS === 'ios') return 'http://127.0.0.1:8000';
  return 'http://192.168.0.100:8000';
};

const API_BASE_URL = resolveApiBaseUrl();

export default function PredictPage() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.8,
      base64: false, // Set to false to avoid memory issues
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setResult(null);
      setError(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setResult(null);
      setError(null);
    }
  };

  const submitImage = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      const uri = image.uri;
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : 'image/jpeg';

      // @ts-ignore - React Native's FormData append with object
      formData.append('file', {
        uri: uri,
        name: filename,
        type: fileType,
      });

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        let errorMessage = `Prediction failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResult(data);
      Alert.alert('Success', 'Prediction completed successfully!');
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', `Failed to get prediction: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Prediction workspace</Text>
        <Text style={styles.title}>Upload a scan and let the model return the likely tumor type.</Text>
        <Text style={styles.description}>
          The frontend sends the image to FastAPI, the model classifies it, and the
          result is shown instantly with confidence and top alternatives.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.ghostButton} onPress={pickImage}>
            <Text style={styles.ghostButtonText}>Choose from gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostButton} onPress={takePhoto}>
            <Text style={styles.ghostButtonText}>Take photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.uploadCard}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>MRI</Text>
              <Text style={styles.placeholderTitle}>Select an MRI image</Text>
              <Text style={styles.placeholderText}>
                PNG, JPG, or JPEG files work best for the classifier.
              </Text>
            </View>
          )}

          <View style={styles.uploadActions}>
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={submitImage}
              disabled={loading || !image}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Run prediction</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={clearImage}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          {image && (
            <Text style={styles.fileName}>Selected file: {image.fileName || 'image'}</Text>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.panelLabel}>Prediction result</Text>

          {result ? (
            <>
              <View style={styles.resultHero}>
                <Text style={styles.resultLabel}>{result.prediction.display_label}</Text>
                <Text style={styles.resultConfidence}>
                  {result.prediction.confidence.toFixed(2)}% confidence
                </Text>
              </View>

              <View style={styles.resultList}>
                {result.top_predictions && result.top_predictions.map((item, index) => (
                  <View style={styles.resultItem} key={index}>
                    <Text style={styles.resultItemLabel}>{item.display_label}</Text>
                    <Text style={styles.resultItemValue}>
                      {item.confidence.toFixed(2)}%
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={styles.resultMeta}>File processed: {result.filename}</Text>
            </>
          ) : (
            <View style={styles.resultEmpty}>
              <Text style={styles.emptyTitle}>No prediction yet</Text>
              <Text style={styles.emptyText}>
                The model output will appear here after you upload a scan.
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  eyebrow: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ghostButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    flex: 1,
  },
  ghostButtonText: {
    color: '#374151',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    fontSize: 14,
  },
  grid: {
    padding: 20,
    gap: 20,
  },
  uploadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  uploadIcon: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    color: '#9ca3af',
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  uploadActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontFamily: 'Inter_600SemiBold',
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
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  fileName: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#ef4444',
    marginTop: 12,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  panelLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  resultHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultLabel: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  resultConfidence: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#6b7280',
  },
  resultList: {
    gap: 12,
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resultItemLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#374151',
  },
  resultItemValue: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#3b82f6',
  },
  resultMeta: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#9ca3af',
    marginTop: 12,
  },
  resultEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
});