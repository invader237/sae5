import { useEffect, useRef, useState } from 'react';
import { Pressable, View, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as ImagePicker from 'expo-image-picker';
import { uploadFrame } from '@/api/upload.api';
import Constants from 'expo-constants';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const tabBarHeight = useBottomTabBarHeight();
  const [permission, requestPermission] = useCameraPermissions();
  const [hasAsked, setHasAsked] = useState(false);
  const cameraRef = useRef<any>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const isUploadingRef = useRef(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [zoom] = useState(0.1);

  const API_BASE = Constants.expoConfig?.extra?.backendApiAddress || process.env.EXPO_PUBLIC_BACKEND_API_ADDRESS ; //|| 'http://localhost:8000'
  const FAST_API_ENDPOINT = `${API_BASE}/pictures/import?type=analyse`;

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission refusée pour accéder à la galerie');
      return;
    }


    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      try {
        await uploadFrame(FAST_API_ENDPOINT, result.assets[0].uri);
        alert('Image envoyée avec succès !');
      } catch {
        alert('Erreur lors de l\'envoi de l\'image');
      }
    }
  };

  useEffect(() => {
    if (!permission && !hasAsked) {
      setHasAsked(true);
      requestPermission();
    }
  }, [permission, hasAsked, requestPermission]);

  const isGranted = permission?.granted;

  // Capture et envoi 1 image par seconde (l'image doit aussi respecter les conditions de focus, camera ready et analyse actif)
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
  } catch {
  } finally {
        isUploadingRef.current = false;
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isFocused, isGranted, cameraReady, isStreaming]);

  return (
    <View
      className="flex-1 bg-white px-6 pt-4"
      style={{ paddingBottom: insets.bottom + tabBarHeight + 12 }}
    >
      <Text className="text-[24px] font-bold text-[#007bff] mb-2">Caméra</Text>

      <View className="flex-1 rounded-xl overflow-hidden border border-neutral-200/50">
        {isGranted ? (
          <CameraView
            ref={cameraRef}
            className="absolute inset-0"
            zoom={zoom}
            onCameraReady={() => setCameraReady(true)}
          />
        ) : (
          <View className="flex-1 items-center justify-center p-4 gap-3">
            <Text className="text-center text-[#555]">
              Autorisez l&apos;accès à la caméra pour afficher l&apos;aperçu.
            </Text>
          </View>
        )}
      </View>

      {isGranted && (
        <Pressable
          onPress={() => setIsStreaming((s) => !s)}
          className={`mt-5 h-12 px-5 rounded-xl items-center justify-center ${
            isStreaming ? 'bg-[#FF3B30]' : 'bg-[#007bff]'
          }`}
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <Text className="text-white text-lg font-semibold">
            {isStreaming ? "Arrêter l'envoi" : "Démarrer l'envoi"}
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={pickImage}
        className={`${isGranted ? 'mt-3' : 'mt-5'} h-12 px-5 rounded-xl items-center justify-center bg-[#5856D6]`}
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      >
        <Text className="text-white text-lg font-semibold">
          📷 Sélectionner une photo
        </Text>
      </Pressable>
    </View>
  );
}