import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#007bff",
    marginTop: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
