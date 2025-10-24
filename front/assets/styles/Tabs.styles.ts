import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  tabBar: {
    height: 85,
    borderTopWidth: 0,
    position: "absolute",
    backgroundColor: Colors.tabBarBlur,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    padding: 6,
  },
  iconWrapActive: {
    backgroundColor: "rgba(10,132,255,0.15)",
  },
});
