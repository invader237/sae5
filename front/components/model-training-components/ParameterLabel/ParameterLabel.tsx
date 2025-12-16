import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const ParameterLabel = ({ label, onInfo }) => (
  <View className="flex-row items-center mb-1">
    <Text className="text-sm font-medium text-gray-700 mr-1">
      {label}
    </Text>
    <TouchableOpacity onPress={onInfo}>
      <MaterialIcons name="help-outline" size={18} color="#6b7280" />
    </TouchableOpacity>
  </View>
);

export default ParameterLabel;
