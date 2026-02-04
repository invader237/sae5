import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Spinner} from '@/components/Spinner';
import { useChangePasswordForm } from "@/hooks/camera/useChangePasswordForm";
import { Colors, BorderRadius } from "@/constants/theme";

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
        <View
          className="mb-3 rounded-xl px-3 py-2"
          style={{
            backgroundColor: Colors.dangerLight,
            borderWidth: 1,
            borderColor: Colors.danger,
          }}
        >
          <Text className="text-sm" style={{ color: Colors.danger }}>
            {errorMsg}
          </Text>
        </View>
      )}

      {successMsg && (
        <View
          className="mb-3 rounded-xl px-3 py-2"
          style={{
            backgroundColor: Colors.successLight,
            borderWidth: 1,
            borderColor: Colors.success,
          }}
        >
          <Text className="text-sm" style={{ color: Colors.success }}>
            {successMsg}
          </Text>
        </View>
      )}

      <View className="mb-3">
        <Text className="text-base font-semibold mb-1" style={{ color: Colors.text }}>
          Ancien mot de passe
        </Text>
        <TextInput
          className="m-5 rounded-xl px-3 py-2 text-base"
          style={{
            backgroundColor: Colors.inputBackground,
            borderWidth: 1,
            borderColor: Colors.border,
            color: Colors.text,
          }}
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      <View className="mb-3">
        <Text className="text-base font-semibold mb-1" style={{ color: Colors.text }}>
          Nouveau mot de passe
        </Text>
        <TextInput
          className="m-5 rounded-xl px-3 py-2 text-base"
          style={{
            backgroundColor: Colors.inputBackground,
            borderWidth: 1,
            borderColor: Colors.border,
            color: Colors.text,
          }}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      <View className="mb-4">
        <Text className="text-base font-semibold mb-1" style={{ color: Colors.text }}>
          Confirmation du nouveau mot de passe
        </Text>
        <TextInput
          className="m-5 rounded-xl px-3 py-2 text-base"
          style={{
            backgroundColor: Colors.inputBackground,
            borderWidth: 1,
            borderColor: Colors.border,
            color: Colors.text,
          }}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      <TouchableOpacity
        className="py-3 items-center"
        style={{
          backgroundColor: Colors.primary,
          borderRadius: BorderRadius.lg,
          opacity: loading ? 0.7 : 1,
        }}
        disabled={loading}
        onPress={submit}
      >
        {loading ? (
          <Spinner color={Colors.white} />
        ) : (
          <Text className="font-semibold text-base" style={{ color: Colors.onPrimary }}>
            Mettre à jour le mot de passe
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
