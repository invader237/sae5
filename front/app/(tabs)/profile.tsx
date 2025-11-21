import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthForm } from "@/components/authentification/AuthForm";
import { API_BASE_URL } from "@/constants/api";

type User = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (storedToken) {
          await fetchMe(storedToken);
        }
      } catch (error) {
        console.log("Error loading token", error);
      } finally {
        setInitializing(false);
      }
    };

    void bootstrap();
  }, []);

  const fetchMe = async (accessToken: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        // 401 → token invalide ou expiré : on déconnecte proprement
        if (res.status === 401) {
          await handleLogout();
        }
        return;
      }

      const data: User = await res.json();
      setUser(data);
    } catch (error) {
      console.log("FETCH /auth/me error:", error);
    }
  };

  const handleAuthenticated = async (accessToken: string) => {
    await AsyncStorage.setItem("authToken", accessToken);
    await fetchMe(accessToken);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    setUser(null);
  };

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
        <Text className="mt-2 text-gray-500">Chargement du profil…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 items-center justify-center px-6 py-10">
        {user ? (
          <View className="w-full items-center justify-center mt-2">
            <Text className="text-3xl font-extrabold text-blue-500 mb-4">
              Profil
            </Text>
            <Text className="text-base text-gray-600 mb-4 text-center">
              Connecté en tant que :
            </Text>

            <View className="bg-white rounded-2xl px-4 py-4 mb-6 shadow border border-gray-100">
              <Text className="text-blue-500 text-lg font-semibold mb-1">
                Username : {user.name}
              </Text>
              <Text className="text-gray-700">email : {user.email}</Text>
            </View>

            <TouchableOpacity
              className="bg-red-500 rounded-xl py-2 px-4 items-center w-[150px] mx-auto"
              onPress={handleLogout}
            >
              <Text className="text-white font-semibold">Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <AuthForm onAuthenticated={handleAuthenticated} />
        )}
      </View>
    </ScrollView>
  );
}
