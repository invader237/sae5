// components/authentification/AuthForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Spinner } from '@/components/Spinner';
import { login, register } from "@/api/auth.api";

type Mode = "login" | "register";

type AuthFormProps = {
  onAuthenticated: (token: string) => Promise<void> | void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  /**
   * Transforme la réponse d'erreur du backend en message lisible.
   */
  const buildErrorMessage = (
    status: number,
    body: any,
    defaultMsg: string
  ): string => {
    // Si le back renvoie directement une string dans "detail"
    if (typeof body?.detail === "string") {
      return body.detail;
    }

    // Cas typique des 422 FastAPI (erreurs de validation)
    if (Array.isArray(body?.detail) && body.detail.length > 0) {
      const first = body.detail[0];
      const loc = (first.loc || []).join(".");
      const type = first.type || "";

      if (loc.includes("email") && type.includes("email")) {
        return "Merci de saisir une adresse e-mail valide.";
      }
      if (loc.includes("password")) {
        return "Le mot de passe saisi n'est pas valide.";
      }
      return "Certaines informations sont invalides, merci de vérifier le formulaire.";
    }

    // Status connus
    if (status === 401) {
      return "Email ou mot de passe incorrect.";
    }
    if (status === 500) {
      return "Email ou mot de passe incorrect.";
    }
    if (status === 400) {
      return defaultMsg;
    }

    return "Une erreur est survenue. Merci de réessayer.";
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setErrorMessage("Merci de remplir tous les champs.");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage("Merci de saisir une adresse e-mail valide.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Appel API d'inscription
      await register({ username, email, password });

      // Connexion automatique après inscription
      await handleLogin(true);
    } catch (err: any) {
      console.log("REGISTER error", err);
      const status = err?.response?.status ?? 0;
      const body = err?.response?.data ?? null;

      const msg = buildErrorMessage(
        status,
        body,
        "Erreur lors de l'inscription."
      );
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (fromRegister = false) => {
    if (!email || !password) {
      setErrorMessage("Merci de renseigner email et mot de passe.");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage("Merci de saisir une adresse e-mail valide.");
      return;
    }

    if (!fromRegister) setLoading(true);
    setErrorMessage(null);

    try {
      const res = await login({ email, password });
      const token = res.access_token;

      await onAuthenticated(token);
      resetFields();
    } catch (err: any) {
      console.log("LOGIN error", err);
      const status = err?.response?.status ?? 0;
      const body = err?.response?.data ?? null;

      const msg = buildErrorMessage(
        status,
        body,
        "Erreur lors de la connexion."
      );
      setErrorMessage(msg);
    } finally {
      if (!fromRegister) {
        setLoading(false);
      }
    }
  };

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
