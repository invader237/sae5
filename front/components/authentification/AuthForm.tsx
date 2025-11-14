import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { API_BASE_URL } from "@/constants/api";

type Mode = "login" | "register";

type AuthFormProps = {
  onAuthenticated: (token: string) => Promise<void> | void;
};

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetFields = () => {
    setEmail("");
    setUsername("");
    setPassword("");
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setErrorMessage(null);
    resetFields();
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setErrorMessage("Merci de remplir tous les champs.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorMessage(body?.detail || "Erreur lors de l'inscription.");
        setLoading(false);
        return;
      }

      // Connexion automatique après inscription
      await handleLogin(true);
    } catch {
      setErrorMessage("Erreur réseau : impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (fromRegister = false) => {
    if (!email || !password) {
      setErrorMessage("Merci de renseigner email et mot de passe.");
      return;
    }

    if (!fromRegister) setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorMessage(body?.detail || "Erreur lors de la connexion.");
        if (!fromRegister) setLoading(false);
        return;
      }

      const token = body.access_token;
      await onAuthenticated(token);

      resetFields();
    } catch {
      if (!fromRegister) {
        setErrorMessage("Erreur réseau : impossible de contacter le serveur.");
      }
    } finally {
      if (!fromRegister) setLoading(false);
    }
  };

  return (
    <View className="w-full mt-6">
      <View className="bg-white rounded-2xl px-5 py-6 shadow border border-gray-100">
        <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {mode === "login" ? "Connexion" : "Création de compte"}
        </Text>

        {errorMessage && (
          <View className="mb-3">
            <Text className="text-red-500 text-sm text-center">
              {errorMessage}
            </Text>
          </View>
        )}

        {mode === "register" && (
          <View className="mb-3">
            <Text className="mb-1 text-gray-700 text-sm">
              Nom d'utilisateur
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
            <ActivityIndicator color="#fff" />
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
