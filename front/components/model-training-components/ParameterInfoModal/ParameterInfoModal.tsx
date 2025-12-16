import { Modal, View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const ParameterInfoModal = ({ visible, onClose, title, description, increase, decrease }) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-center items-center px-6">
        <View className="bg-white rounded-xl p-5 w-full max-w-md">

          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-800">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text className="text-sm text-gray-700 mb-4">
            {description}
          </Text>

          {/* Effects */}
          <View className="gap-2">
            <Text className="text-sm text-green-700">
              📈 Augmenter : {increase}
            </Text>
            <Text className="text-sm text-red-700">
              📉 Diminuer : {decrease}
            </Text>
          </View>

          {/* Action */}
          <TouchableOpacity
            onPress={onClose}
            className="mt-5 bg-[#007bff] py-2 rounded-md"
          >
            <Text className="text-white font-semibold text-center">
              Compris
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

export default ParameterInfoModal;
