import React, { useState, useRef } from 'react';
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
import * as FileSystem from 'expo-file-system';

const API_BASE_URL = 'http://192.168.1.x:8000'; // Replace with your local IP

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
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
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
      base64: true,
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
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: uri,
        name: filename,
        type: type,
      });

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', 'Failed to get prediction. Please check your connection.');
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
              <Text style={styles.placeholderTitle}>Drop your MRI image here</Text>
              <Text style={styles.placeholderText}>
                PNG, JPG, or JPEG files work best for the classifier.
              </Text>
            </View>
          )}

          <View style={styles.uploadActions}>
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={submitImage}
              disabled={loading}
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
                {result.top_predictions.map((item) => (
                  <View style={styles.resultItem} key={item.label}>
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
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
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
    fontWeight: '500',
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
  },
  uploadPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  uploadIcon: {
    fontSize: 48,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
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
  fileName: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 12,
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
    fontWeight: '600',
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
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  resultConfidence: {
    fontSize: 16,
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
    color: '#374151',
  },
  resultItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  resultMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 12,
  },
  resultEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});