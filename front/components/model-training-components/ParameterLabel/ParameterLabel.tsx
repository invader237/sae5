import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

const ParameterLabel = ({ label, onInfo }) => (
  <View className="flex-row items-center mb-1">
    <Text className="text-sm font-medium mr-1" style={{ color: Colors.textSecondary }}>
      {label}
    </Text>
    <TouchableOpacity onPress={onInfo}>
      <MaterialIcons name="help-outline" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  </View>
);

export default ParameterLabel;
