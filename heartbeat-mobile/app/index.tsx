import { HeartBeat } from "@/components/HeartBeat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import { Pressable } from "react-native";

export default function HomeScreen() {
  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <HeartBeat></HeartBeat>
      <Link href="/history" asChild>
        <Pressable>
          <ThemedText>Istoric</ThemedText>
        </Pressable>
      </Link>
    </ThemedView>
  );
}
