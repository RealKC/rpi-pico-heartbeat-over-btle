import { HeartBeat } from "@/components/HeartBeat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MigrationRunner } from "@/db/migration-runner";
import { DatabaseProvider, useDatabase } from "@/db/provider";
import { historicalHeartbeats } from "@/db/schema";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
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
      <DatabaseProvider>
        <MigrationRunner>
          <HeartBeat></HeartBeat>
          <Link href="/history" asChild>
            <Pressable>
              <ThemedText>Istoric</ThemedText>
            </Pressable>
          </Link>
          <Test />
        </MigrationRunner>
      </DatabaseProvider>
    </ThemedView>
  );
}

function Test() {
  const { db } = useDatabase();

  const [values, setValues] = useState<
    (typeof historicalHeartbeats.$inferSelect)[] | null
  >(null);

  useEffect(() => {
    async function fetch() {
      await db
        .insert(historicalHeartbeats)
        .values({ value: 80, timestamp: Date.now() });

      setValues(await db.select().from(historicalHeartbeats));
    }

    if (!values) {
      fetch();
    }
  });

  if (!values) {
    return <ThemedText>Loading...</ThemedText>;
  }

  return (
    <ThemedView>
      {values.map((value) => (
        <ThemedText key={value.timestamp}>
          {value.timestamp} {value.value}
        </ThemedText>
      ))}
    </ThemedView>
  );
}
