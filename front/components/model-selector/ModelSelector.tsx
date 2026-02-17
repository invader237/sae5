import React from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useModelSelector } from "@/hooks/models/useModelSelector";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";

interface ModelSelectorProps {
  controller?: ReturnType<typeof useModelSelector>;
}

export default function ModelSelector({ controller }: ModelSelectorProps) {
  const internalController = useModelSelector();
  const {
    model,
    modelsList,
    showConfirm,
    handleSelect,
    refreshModels,
    confirm,
    cancel,
  } = controller ?? internalController;

  return (
    <>
      <View 
        className="p-5 gap-4"
        style={{
          backgroundColor: Colors.white,
          borderRadius: BorderRadius.lg,
          ...Shadows.md,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text 
              className="text-xl font-bold"
              style={{ color: Colors.text }}
            >
              Modèle
            </Text>
          </View>

          <TouchableOpacity
            onPress={refreshModels}
            className="flex-row items-center justify-center"
            style={{
              backgroundColor: Colors.primary,
              borderRadius: BorderRadius.full,
              width: 44,
              height: 44,
            }}
          >
            <MaterialIcons name="refresh" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Picker */}
        <View 
          className="overflow-hidden cursor-pointer"
          style={{
            backgroundColor: Colors.inputBackground,
            borderRadius: BorderRadius.md,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Picker
            selectedValue={model ?? ""}
            onValueChange={handleSelect}
            className="h-12 mx-2"
            style={{ color: Colors.text }}
          >
              {!model && (
                <Picker.Item
                  label="-- Sélectionner un modèle --"
                  value=""
                  enabled={false}
                />
              )}
            {modelsList.map((m) => (
              <Picker.Item
                key={m.id}
                value={m.id}
                label={`${m.is_active ? "✔ " : ""}${m.name}`}
              />
            ))}
          </Picker>
        </View>

        {/* Description */}
        <Text 
          className="text-sm leading-5"
          style={{ color: Colors.textSecondary }}
        >
          Sélectionnez un modèle dans la liste déroulante ci-dessus.
        </Text>
      </View>

      {/* Modal de confirmation */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={cancel}
      >
        <View 
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <View 
            className="w-11/12 max-w-md p-6"
            style={{
              backgroundColor: Colors.white,
              borderRadius: BorderRadius.xl,
              ...Shadows.lg,
            }}
          >
            <Text 
              className="text-xl font-bold mb-2"
              style={{ color: Colors.text }}
            >
              Confirmation
            </Text>
            <Text 
              className="mb-6"
              style={{ color: Colors.textSecondary }}
            >
              Voulez-vous vraiment changer de modèle ?
            </Text>

            <View className="flex-row justify-end gap-3">
              <Pressable
                onPress={cancel}
                className="px-6 py-3"
                style={{
                  backgroundColor: Colors.inputBackground,
                  borderRadius: BorderRadius.full,
                }}
              >
                <Text 
                  className="font-semibold"
                  style={{ color: Colors.textSecondary }}
                >
                  Annuler
                </Text>
              </Pressable>

              <Pressable
                onPress={confirm}
                className="px-6 py-3"
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: BorderRadius.full,
                }}
              >
                <Text className="font-semibold" style={{ color: Colors.onPrimary }}>
                  Confirmer
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
