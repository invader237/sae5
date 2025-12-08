import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Spinner } from '@/components/Spinner';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthForm } from "@/components/authentification/AuthForm";
import { ChangePasswordForm } from "@/components/authentification/ChangePasswordForm";
import { fetchMe, UserDTO } from "@/api/auth.api";

export default function ProfileScreen() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await AsyncStorage.removeItem("authToken");
    setUser(null);
    setToken(null);
    setIsPasswordModalOpen(false);
  }, []);

  const fetchAndSetUser = useCallback(async (accessToken: string) => {
    try {
      const data = await fetchMe(accessToken);
      setUser(data);
    } catch (error: any) {
      const status = error?.response?.status;
      // 401 → token invalide ou expiré : on déconnecte proprement
      if (status === 401) {
        await handleLogout();
      } else {
        console.log("FETCH /auth/me error:", error);
      }
    }
  }, [handleLogout]);

  const handleAuthenticated = useCallback(async (accessToken: string) => {
    await AsyncStorage.setItem("authToken", accessToken);
    setToken(accessToken);
    await fetchAndSetUser(accessToken);
  }, [fetchAndSetUser]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (storedToken) {
          setToken(storedToken);
          await fetchAndSetUser(storedToken);
        }
      } catch (error) {
        console.log("Error loading token", error);
      } finally {
        setInitializing(false);
      }
    };

    void bootstrap();
  }, [fetchAndSetUser]);

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Spinner />
        <Text className="mt-2 text-gray-500">Chargement du profil…</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 items-center justify-center px-6 py-10">
          {user && token ? (
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
                className="bg-blue-500 rounded-xl py-2 px-4 items-center w-[150px] mx-auto mt-6"
                onPress={() => setIsPasswordModalOpen(true)}
              >
                <Text className="text-white font-semibold">Modifier mdp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-red-500 rounded-xl py-2 px-4 items-center w-[150px] mx-auto mt-6"
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

      <Modal
        visible={isPasswordModalOpen}
        animationType="slide"
        transparent={false}
      >
        <View className="flex-1 bg-white px-6 py-10">
          <TouchableOpacity
            className="mb-4"
            onPress={() => setIsPasswordModalOpen(false)}
          >
            <Text className="text-blue-500 text-lg font-semibold">Fermer</Text>
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-gray-800 mb-4">
            Changement du mot de passe
          </Text>

          {token && <ChangePasswordForm token={token} />}
        </View>
      </Modal>
    </>
  );
}
