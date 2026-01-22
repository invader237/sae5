import { useEffect, useMemo, useRef, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { uploadFrame } from "@/api/picture.api";
import { InferenceResultDTO } from "@/api/DTO/inference.dto";

export function useCameraInference() {
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [hasAsked, setHasAsked] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const isUploadingRef = useRef(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [zoom] = useState(0.1);
  const [modalVisible, setModalVisible] = useState(false);
  const [inferenceResult, setInferenceResult] = useState<InferenceResultDTO | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentInference, setCurrentInference] = useState<InferenceResultDTO | null>(null);

  useEffect(() => {
    if (!permission && !hasAsked) {
      setHasAsked(true);
      requestPermission();
    }
  }, [permission, hasAsked, requestPermission]);

  const isGranted = permission?.granted;

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
          const res = await uploadFrame(picture.uri);
          setCurrentInference(res);
        }
      } catch (error) {
        console.warn("Erreur lors de l'envoi temps réel:", error);
      } finally {
        isUploadingRef.current = false;
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isFocused, isGranted, cameraReady, isStreaming]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission refusée pour accéder à la galerie");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      try {
        setInferenceResult(null);
        setModalVisible(true);
        setIsAnalyzing(true);

        const inference = await uploadFrame(result.assets[0].uri);
        setInferenceResult(inference);
      } catch {
        alert("Erreur lors de l'envoi de l'image");
        setModalVisible(false);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const cameraProps = useMemo(
    () => ({
      ref: cameraRef,
      active: isFocused,
      facing: "back" as const,
      zoom,
      onCameraReady: () => setCameraReady(true),
      onMountError: (e: any) => {
        console.error("Camera mount error", e);
      },
    }),
    [isFocused, zoom]
  );

  return {
    permission,
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
  };
}
