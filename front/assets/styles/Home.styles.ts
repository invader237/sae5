import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  title: { color: Colors.primary, fontSize: 28, fontWeight: "800" },
  subtitle: { color: "#555", fontSize: 16, marginTop: 6 },
  button: {
    backgroundColor: Colors.primary,
    padding: 14,
    marginTop: 25,
    width: 150,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: Colors.white, fontSize: 20 },
});
