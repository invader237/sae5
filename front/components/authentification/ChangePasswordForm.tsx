import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Spinner } from '@/components/Spinner';
import { changePassword } from "@/api/auth.api";

type ChangePasswordFormProps = {
  token: string;
};

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  token,
}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSuccessMsg(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg("Merci de remplir tous les champs.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg(
        "Le nouveau mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await changePassword(token, {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg("Mot de passe mis à jour avec succès.");
    } catch (error: any) {
      const detail =
        typeof error?.response?.data?.detail === "string"
          ? error.response.data.detail
          : "Impossible de modifier le mot de passe.";

      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  };

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
        onPress={handleSubmit}
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
