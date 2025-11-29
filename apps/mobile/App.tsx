import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { getKSTDateString } from "@myrecords/core";

export default function App() {
  const today = getKSTDateString();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyRecords</Text>
      <Text style={styles.subtitle}>오늘 날짜: {today}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7A6F",
  },
});
