// components/authentification/AuthForm.tsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Spinner} from '@/components/Spinner';
import { useAuthForm } from "@/hooks/auth/useAuthForm";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";

type AuthFormProps = {
  onAuthenticated: (token: string) => Promise<void> | void;
};

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticated }) => {
  const {
    mode,
    email,
    username,
    password,
    loading,
    errorMessage,
    setEmail,
    setUsername,
    setPassword,
    switchMode,
    handleLogin,
    handleRegister,
  } = useAuthForm({ onAuthenticated });

  return (
    <View className="w-full mt-6">
      <View
        className="px-5 py-6"
        style={{
          backgroundColor: Colors.cardBackground,
          borderRadius: BorderRadius.xl,
          ...Shadows.md,
        }}
      >
        <Text className="text-lg font-semibold mb-4 text-center" style={{ color: Colors.text }}>
          {mode === "login" ? "Connexion" : "Création de compte"}
        </Text>

        {/* 🟥 Petite bannière d'erreur */}
        {errorMessage && (
          <View
            className="mb-4 rounded-xl px-3 py-2 flex-row"
            style={{
              backgroundColor: Colors.dangerLight,
              borderWidth: 1,
              borderColor: Colors.danger,
            }}
          >
            <Text className="text-sm flex-1" style={{ color: Colors.danger }}>
              {errorMessage}
            </Text>
          </View>
        )}

        {mode === "register" && (
          <View className="mb-3">
            <Text className="mb-1 text-sm" style={{ color: Colors.textSecondary }}>
              Nom d&apos;utilisateur
            </Text>
            <TextInput
              className="rounded-xl px-3 py-2 text-base"
              style={{
                backgroundColor: Colors.inputBackground,
                borderWidth: 1,
                borderColor: Colors.border,
                color: Colors.text,
              }}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="Votre pseudo"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        <View className="mb-3">
          <Text className="mb-1 text-sm" style={{ color: Colors.textSecondary }}>
            Email
          </Text>
          <TextInput
            className="rounded-xl px-3 py-2 text-base"
            style={{
              backgroundColor: Colors.inputBackground,
              borderWidth: 1,
              borderColor: Colors.border,
              color: Colors.text,
            }}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="votre.email@exemple.com"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View className="mb-5">
          <Text className="mb-1 text-sm" style={{ color: Colors.textSecondary }}>
            Mot de passe
          </Text>
          <TextInput
            className="rounded-xl px-3 py-2 text-base"
            style={{
              backgroundColor: Colors.inputBackground,
              borderWidth: 1,
              borderColor: Colors.border,
              color: Colors.text,
            }}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <TouchableOpacity
          className="py-3 items-center mb-3"
          style={{
            backgroundColor: Colors.primary,
            borderRadius: BorderRadius.lg,
            opacity: loading ? 0.7 : 1,
          }}
          disabled={loading}
          onPress={mode === "login" ? () => handleLogin() : handleRegister}
        >
          {loading ? (
            <Spinner color={Colors.white} />
          ) : (
            <Text className="font-semibold text-base" style={{ color: Colors.onPrimary }}>
              {mode === "login" ? "Se connecter" : "Créer un compte"}
            </Text>
          )}
        </TouchableOpacity>

        {mode === "login" ? (
          <View className="flex-row justify-center">
            <Text className="text-sm" style={{ color: Colors.textSecondary }}>
              Pas encore de compte ?{" "}
            </Text>
            <TouchableOpacity onPress={() => switchMode("register")}>
              <Text className="font-semibold text-sm" style={{ color: Colors.primary }}>
                Créer un compte
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row justify-center">
            <Text className="text-sm" style={{ color: Colors.textSecondary }}>
              Déjà inscrit ?{" "}
            </Text>
            <TouchableOpacity onPress={() => switchMode("login")}>
              <Text className="font-semibold text-sm" style={{ color: Colors.primary }}>
                Revenir à la connexion
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
