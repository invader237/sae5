import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { CameraView } from 'expo-camera';
import { InferenceResultModal } from '@/components/InferenceResultModal';
import { RealTimeOverlay } from '@/components/RealTimeOverlay';
import { useCameraInference } from '@/hooks/camera/useCameraInference';
import { Colors, BorderRadius } from '@/constants/theme';

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
      className="flex-1 px-6 pt-4"
      style={{
        backgroundColor: Colors.background,
        paddingBottom: insets.bottom + tabBarHeight + 12,
      }}
    >
      <Text
        className="text-[24px] font-bold mb-2"
        style={{ color: Colors.text }}
      >
        Caméra
      </Text>

      <View
        className="flex-1 overflow-hidden relative"
        style={{
          borderRadius: BorderRadius.lg,
          borderWidth: 1,
          borderColor: Colors.border,
        }}
      >
        {isGranted ? (
          <CameraView
            {...cameraProps}
            className="absolute inset-0"
            style={{ flex: 1 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center p-4 gap-3">
            <Text className="text-center" style={{ color: Colors.textSecondary }}>
              Autorisez l&apos;accès à la caméra pour afficher l&apos;aperçu.
            </Text>
          </View>
        )}

        {isGranted && isStreaming && (
          <RealTimeOverlay inferenceResult={currentInference} isAnalyzing={isAnalyzing} />
        )}
      </View>

      {isGranted && (
        <TouchableOpacity
          onPress={() => setIsStreaming((s) => !s)}
          activeOpacity={0.9}
          className="mt-5 h-12 px-5 items-center justify-center"
          style={{
            borderRadius: BorderRadius.lg,
            backgroundColor: isStreaming ? Colors.danger : Colors.primary,
          }}
        >
          <Text className="text-lg font-semibold" style={{ color: Colors.white }}>
            {isStreaming ? "Arrêter l'envoi" : "Démarrer l'envoi"}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={pickImage}
        activeOpacity={0.9}
        className="mt-3 h-12 px-5 items-center justify-center"
        style={{
          borderRadius: BorderRadius.lg,
          backgroundColor: Colors.white,
          borderWidth: 1,
          borderColor: Colors.primary,
        }}
      >
        <Text className="text-lg font-semibold" style={{ color: Colors.primary }}>
          Importer depuis la galerie
        </Text>
      </TouchableOpacity>

      <InferenceResultModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        inferenceResult={inferenceResult}
        isLoading={isAnalyzing}
      />
    </View>
  );
}
