import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Spinner} from '@/components/Spinner';
import { useChangePasswordForm } from "@/hooks/camera/useChangePasswordForm";

type ChangePasswordFormProps = {
  token: string;
};

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  token,
}) => {
  const {
    oldPassword,
    newPassword,
    confirmPassword,
    loading,
    errorMsg,
    successMsg,
    setOldPassword,
    setNewPassword,
    setConfirmPassword,
    submit,
  } = useChangePasswordForm({ token });

  return (
    <View className="w-full mt-6">
      {errorMsg && (
        <View className="mb-3 rounded-xl bg-red-100 border border-red-300 px-3 py-2">
          <Text className="text-red-700 text-sm">{errorMsg}</Text>
        </View>
      )}

      {successMsg && (
        <View className="mb-3 rounded-xl bg-green-100 border border-green-300 px-3 py-2">
          <Text className="text-green-700 text-sm">{successMsg}</Text>
        </View>
      )}

      <View className="mb-3">
        <Text className="text-base font-semibold mb-1 text-gray-800">
          Ancien mot de passe
        </Text>
        <TextInput
          className="bg-gray-100 border border-gray-300 m-5 rounded-xl px-3 py-2 text-base"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View className="mb-3">
        <Text className="text-base font-semibold mb-1 text-gray-800">
          Nouveau mot de passe
        </Text>
        <TextInput
          className="bg-gray-100 border border-gray-300 m-5 rounded-xl px-3 py-2 text-base"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View className="mb-4">
        <Text className="text-base font-semibold mb-1 text-gray-800">
          Confirmation du nouveau mot de passe
        </Text>
        <TextInput
          className="bg-gray-100 border border-gray-300 m-5 rounded-xl px-3 py-2 text-base"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <TouchableOpacity
        className="bg-blue-500 rounded-xl py-3 items-center"
        disabled={loading}
        onPress={submit}
      >
        {loading ? (
          <Spinner color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">
            Mettre à jour le mot de passe
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
