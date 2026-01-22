import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { Spinner } from "@/components/Spinner";
import { AuthForm } from "@/components/authentification/AuthForm";
import { ChangePasswordForm } from "@/components/authentification/ChangePasswordForm";
import { useAuth } from "@/hooks/auth/useAuth";

export default function ProfileScreen() {
  const { user, token, isLoading, login, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Spinner />
        <Text className="mt-2 text-gray-500">Chargement du profil…</Text>
      </View>
    );
  }

  if (!user || !token) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <AuthForm onAuthenticated={login} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ padding: 24 }}
      >
        <View className="gap-6">
          {/* HEADER */}
          <View className="items-center">
            <Text className="text-3xl font-extrabold text-gray-800">
              Profil
            </Text>
            <Text className="text-gray-500 mt-1">
              Gestion de votre compte
            </Text>
          </View>

          {/* USER CARD */}
          <View className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <View className="flex-row items-center gap-4">
              <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center">
                <MaterialIcons name="person" size={28} color="#3b82f6" />
              </View>

              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">
                  {user.name}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {user.email}
                </Text>
              </View>
            </View>
          </View>

          {/* ACTIONS */}
          <View className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm gap-4">
            <Text className="text-base font-semibold text-gray-800">
              Sécurité
            </Text>

            <TouchableOpacity
              onPress={() => setShowPasswordModal(true)}
              className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200"
              activeOpacity={0.85}
            >
              <MaterialIcons name="lock" size={22} color="#3b82f6" />
              <Text className="text-blue-600 font-semibold">
                Modifier le mot de passe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={logout}
              className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200"
              activeOpacity={0.85}
            >
              <MaterialIcons name="logout" size={22} color="#ef4444" />
              <Text className="text-red-600 font-semibold">
                Se déconnecter
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-40 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Changer le mot de passe
            </Text>

            <ChangePasswordForm token={token} />

            <TouchableOpacity
              onPress={() => setShowPasswordModal(false)}
              className="mt-5 py-3 rounded-xl bg-gray-100 items-center"
            >
              <Text className="text-gray-700 font-semibold">Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
