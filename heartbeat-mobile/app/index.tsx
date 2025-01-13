import {
  BluetoothContext,
  BluetoothManager,
} from "@/components/BluetoothManager";
import { HeartBeat } from "@/components/HeartBeat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MigrationRunner } from "@/db/migration-runner";
import { DatabaseProvider, useDatabase } from "@/db/provider";
import { historicalHeartbeats } from "@/db/schema";
import Link from "expo-router/link";
import { useContext, useEffect, useState } from "react";
import { Pressable, View } from "react-native";

export default function HomeScreen() {
  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <BluetoothManager>
        <DatabaseProvider>
          <MigrationRunner>
            <HeartBeat></HeartBeat>
            <View style={{ alignItems: "center" }}>
              <Link href="/history" asChild>
                <Pressable>
                  <ThemedText>Istoric</ThemedText>
                </Pressable>
              </Link>
              <HeartBeatInfo />
            </View>
          </MigrationRunner>
        </DatabaseProvider>
      </BluetoothManager>
    </ThemedView>
  );
}

function HeartBeatInfo() {
  const { db } = useDatabase();

  const [values, setValues] = useState<
    (typeof historicalHeartbeats.$inferSelect)[] | null
  >(null);

  const bpm = useContext(BluetoothContext);

  useEffect(() => {
    async function fetch() {
      if (!bpm) {
        return;
      }

      await db
        .insert(historicalHeartbeats)
        .values({ value: bpm, timestamp: Date.now() });

      setValues(await db.select().from(historicalHeartbeats));
    }

    if (!values) {
      fetch();
    }
  });

  if (!bpm) {
    return <View></View>;
  }

  if (!values) {
    return <ThemedText>Loading...</ThemedText>;
  }

  return <ThemedText>{bpm} bpm</ThemedText>;
}
