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
      <View className="bg-white rounded-2xl px-5 py-6 shadow border border-gray-100">
        <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {mode === "login" ? "Connexion" : "Création de compte"}
        </Text>

        {/* 🟥 Petite bannière d'erreur */}
        {errorMessage && (
          <View className="mb-4 rounded-xl bg-red-100 border border-red-300 px-3 py-2 flex-row">
            <Text className="text-red-700 text-sm flex-1">{errorMessage}</Text>
          </View>
        )}

        {mode === "register" && (
          <View className="mb-3">
            <Text className="mb-1 text-gray-700 text-sm">
              Nom d&apos;utilisateur
            </Text>
            <TextInput
              className="bg-gray-100 border border-gray-300 rounded-xl px-3 py-2 text-base"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="Votre pseudo"
              placeholderTextColor="#9ca3af"
            />
          </View>
        )}

        <View className="mb-3">
          <Text className="mb-1 text-gray-700 text-sm">Email</Text>
          <TextInput
            className="bg-gray-100 border border-gray-300 rounded-xl px-3 py-2 text-base"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="votre.email@exemple.com"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View className="mb-5">
          <Text className="mb-1 text-gray-700 text-sm">Mot de passe</Text>
          <TextInput
            className="bg-gray-100 border border-gray-300 rounded-xl px-3 py-2 text-base"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity
          className="bg-blue-500 rounded-xl py-3 items-center mb-3"
          disabled={loading}
          onPress={mode === "login" ? () => handleLogin() : handleRegister}
        >
          {loading ? (
            <Spinner color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">
              {mode === "login" ? "Se connecter" : "Créer un compte"}
            </Text>
          )}
        </TouchableOpacity>

        {mode === "login" ? (
          <View className="flex-row justify-center">
            <Text className="text-gray-600 text-sm">
              Pas encore de compte ?{" "}
            </Text>
            <TouchableOpacity onPress={() => switchMode("register")}>
              <Text className="text-blue-500 font-semibold text-sm">
                Créer un compte
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row justify-center">
            <Text className="text-gray-600 text-sm">Déjà inscrit ? </Text>
            <TouchableOpacity onPress={() => switchMode("login")}>
              <Text className="text-blue-500 font-semibold text-sm">
                Revenir à la connexion
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
