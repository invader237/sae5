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
import { Colors, BorderRadius, Shadows } from "@/constants/theme";

export default function ProfileScreen() {
  const { user, token, isLoading, login, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  if (isLoading) {
    return (
      <View 
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: Colors.background }}
      >
        <Spinner />
        <Text className="mt-2" style={{ color: Colors.textSecondary }}>
          Chargement du profil…
        </Text>
      </View>
    );
  }

  if (!user || !token) {
    return (
      <View 
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: Colors.background }}
      >
        <AuthForm onAuthenticated={login} />
      </View>
    );
  }

  const profileInitial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: Colors.background }}
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
      >
        <View className="gap-6">
          {/* HEADER */}
          <View className="items-center mb-2">
            <Text 
              className="text-3xl font-bold"
              style={{ color: Colors.text }}
            >
              Profil
            </Text>
            <Text 
              className="mt-1"
              style={{ color: Colors.textSecondary }}
            >
              Gestion de votre compte
            </Text>
          </View>

          {/* USER CARD */}
          <View 
            className="p-5"
            style={{
              backgroundColor: Colors.white,
              borderRadius: BorderRadius.xl,
              ...Shadows.md,
            }}
          >
            <View className="flex-row items-center gap-4">
              <View 
                className="w-14 h-14 items-center justify-center"
                style={{
                  borderRadius: BorderRadius.full,
                  backgroundColor: Colors.primary,
                }}
              >
                <Text className="text-xl font-bold" style={{ color: Colors.onPrimary }}>
                  {profileInitial}
                </Text>
              </View>

              <View className="flex-1">
                <Text 
                  className="text-lg font-semibold"
                  style={{ color: Colors.text }}
                >
                  {user.name}
                </Text>
                <Text 
                  className="text-sm"
                  style={{ color: Colors.textSecondary }}
                >
                  {user.email}
                </Text>
              </View>
            </View>
          </View>

          {/* ACTIONS */}
          <View 
            className="p-5 gap-4"
            style={{
              backgroundColor: Colors.white,
              borderRadius: BorderRadius.xl,
              ...Shadows.md,
            }}
          >
            <Text 
              className="text-base font-semibold"
              style={{ color: Colors.text }}
            >
              Sécurité
            </Text>

            <TouchableOpacity
              onPress={() => setShowPasswordModal(true)}
              className="flex-row items-center gap-3 px-4 py-3"
              style={{
                backgroundColor: Colors.white,
                borderRadius: BorderRadius.lg,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
              activeOpacity={0.85}
            >
              <MaterialIcons name="lock" size={22} color={Colors.primaryDark} />
              <Text 
                className="font-semibold"
                style={{ color: Colors.primaryDark }}
              >
                Modifier le mot de passe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={logout}
              className="flex-row items-center gap-3 px-4 py-3"
              style={{
                backgroundColor: Colors.dangerLight,
                borderRadius: BorderRadius.lg,
              }}
              activeOpacity={0.85}
            >
              <MaterialIcons name="logout" size={22} color={Colors.danger} />
              <Text 
                className="font-semibold"
                style={{ color: Colors.danger }}
              >
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
        <View 
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <View 
            className="p-6 w-full max-w-md"
            style={{
              backgroundColor: Colors.white,
              borderRadius: BorderRadius.xl,
              ...Shadows.lg,
            }}
          >
            <Text 
              className="text-xl font-bold mb-4"
              style={{ color: Colors.text }}
            >
              Changer le mot de passe
            </Text>

            <ChangePasswordForm token={token} />

            <TouchableOpacity
              onPress={() => setShowPasswordModal(false)}
              className="mt-5 py-3 items-center"
              style={{
                backgroundColor: Colors.inputBackground,
                borderRadius: BorderRadius.lg,
              }}
            >
              <Text 
                className="font-semibold"
                style={{ color: Colors.textSecondary }}
              >
                Fermer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
