import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [hasAsked, setHasAsked] = useState(false);
  const cameraRef = useRef<any>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const isUploadingRef = useRef(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [zoom, setZoom] = useState(0.1);

  const FAST_API_ENDPOINT = 'http://<VOTRE_IP_OU_DNS>:8000/upload';

  useEffect(() => {
    if (!permission && !hasAsked) {
      setHasAsked(true);
      requestPermission();
    }
  }, [permission, hasAsked, requestPermission]);

  const isGranted = permission?.granted;

  // Capture et envoi 1 image par seconde
  useEffect(() => {
    if (!isFocused || !isGranted || !cameraReady || !isStreaming) return;

    const intervalId = setInterval(async () => {
      if (isUploadingRef.current) return;

      try {
        isUploadingRef.current = true;
        const picture = await cameraRef.current?.takePictureAsync?.({
          quality: 0.5,
          skipProcessing: true,
        });

        if (picture?.uri) {
          await uploadFrame(FAST_API_ENDPOINT, picture.uri);
        }
      } catch (e) {
      } finally {
        isUploadingRef.current = false;
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isFocused, isGranted, cameraReady, isStreaming]);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 5, paddingBottom: insets.bottom + 5 }]}>
      <ThemedText type="title" style={styles.title}>Caméra</ThemedText>

      <View style={styles.cameraBox}>
        {isGranted ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            zoom={zoom}
            onCameraReady={() => setCameraReady(true)}
          />
        ) : (
          <ThemedView style={styles.permissionBox}>
            <ThemedText style={styles.permissionText}>
              Autorisez l'accès à la caméra pour afficher l'aperçu.
            </ThemedText>
          </ThemedView>
        )}
      </View>

      {isGranted && (
        <Pressable
          onPress={() => setIsStreaming((s) => !s)}
          style={({ pressed }) => [
            styles.button,
            isStreaming ? styles.buttonDanger : styles.buttonPrimary,
            pressed && styles.buttonPressed,
          ]}
        >
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            {isStreaming ? 'Arrêter l\'envoi' : 'Démarrer l\'envoi'}
          </ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

// Envoi d’une image au serveur (multipart/form-data)
async function uploadFrame(endpoint: string, uri: string) {
  const form = new FormData();
  form.append(
    'file',
    {
      uri,
      type: 'image/jpeg',
      name: `frame-${Date.now()}.jpg`,
    } as any 
  );

  const res = await fetch(endpoint, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upload échoué (${res.status}): ${text}`);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    marginTop: Platform.select({ ios: 8, android: 8, web: 0 }),
  },
  cameraBox: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  permissionText: {
    textAlign: 'center',
  },
  button: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#0A84FF', // Bleu primaire
  },
  buttonDanger: {
    backgroundColor: '#FF3B30', // Rouge pour arrêter
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
  },
});
