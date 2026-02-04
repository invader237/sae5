import { Modal, View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";

const ParameterInfoModal = ({ visible, onClose, title, description, increase, decrease }) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: Colors.overlaySoft }}
      >
        <View
          className="p-5 w-full max-w-md"
          style={{
            backgroundColor: Colors.cardBackground,
            borderRadius: BorderRadius.lg,
            ...Shadows.md,
          }}
        >

          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold" style={{ color: Colors.text }}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text className="text-sm mb-4" style={{ color: Colors.textSecondary }}>
            {description}
          </Text>

          {/* Effects */}
          <View className="gap-2">
            <Text className="text-sm" style={{ color: Colors.textSecondary }}>
              📈 Augmenter : {increase}
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary }}>
              📉 Diminuer : {decrease}
            </Text>
          </View>

          {/* Action */}
          <TouchableOpacity
            onPress={onClose}
            className="mt-5 py-2"
            style={{
              backgroundColor: Colors.primary,
              borderRadius: BorderRadius.md,
            }}
          >
            <Text className="font-semibold text-center" style={{ color: Colors.onPrimary }}>
              Compris
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

export default ParameterInfoModal;
