import { useDatabase } from "./provider";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "./migrations/migrations";
import { PropsWithChildren } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ActivityIndicator, View } from "react-native";

export function MigrationRunner({ children }: PropsWithChildren) {
  const { db } = useDatabase();
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return <ThemedText>Error running migrations</ThemedText>;
  }

  if (!success) {
    return (
      <ThemedView>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return <View>{children}</View>;
}
