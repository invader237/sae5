import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { CameraView } from 'expo-camera';
import { InferenceResultModal } from '@/components/InferenceResultModal';
import { RealTimeOverlay } from '@/components/RealTimeOverlay';
import { useCameraInference } from '@/hooks/camera/useCameraInference';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const {
    isGranted,
    isStreaming,
    setIsStreaming,
    cameraProps,
    pickImage,
    modalVisible,
    setModalVisible,
    inferenceResult,
    isAnalyzing,
    currentInference,
  } = useCameraInference();

  return (
    <View
      className="flex-1 bg-white px-6 pt-4"
      style={{ paddingBottom: insets.bottom + tabBarHeight + 12 }}
    >
      <Text className="text-[24px] font-bold text-[#007bff] mb-2">Caméra</Text>

      <View className="flex-1 rounded-xl overflow-hidden border border-neutral-200/50 relative">
        {isGranted ? (
          <CameraView
            {...cameraProps}
            className="absolute inset-0"
            style={{ flex: 1 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center p-4 gap-3">
            <Text className="text-center text-[#555]">
              Autorisez l&apos;accès à la caméra pour afficher l&apos;aperçu.
            </Text>
          </View>
        )}

        {isGranted && isStreaming && (
          <RealTimeOverlay inferenceResult={currentInference} isAnalyzing={isAnalyzing} />
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

      <InferenceResultModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        inferenceResult={inferenceResult}
        isLoading={isAnalyzing}
      />
    </View>
  );
}
