import React, { useContext } from "react";
import { useEffect, useState } from "react";
import { EventSubscription, View } from "react-native";
import BleManager, {
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from "react-native-ble-manager";

const BluetoothContext = React.createContext<number | null>(null);

export function useHeartbeat() {
  const state = useContext(BluetoothContext);

  return state;
}

export function BluetoothManager({ children }: { children?: React.ReactNode }) {
  const SERVICE_UUID = "180D";

  const [isConnected, setIsConnected] = useState(false);
  const [heartbeat, setHeartbeat] = useState<number | null>(null);
  const [peripheral, setPeripheral] = useState<Peripheral | null>(null);

  useEffect(() => {
    let listeners: EventSubscription[] = [];
    // @ts-expect-error
    let intervalId = undefined;

    const f = async () => {
      try {
        await BleManager.enableBluetooth();
        await BleManager.start();

        await BleManager.scan([SERVICE_UUID], 0, true, {
          matchMode: BleScanMatchMode.Sticky,
          scanMode: BleScanMode.LowLatency,
          callbackType: BleScanCallbackType.AllMatches,
        });

        // @ts-expect-error
        if (!intervalId)
          intervalId = setInterval(() => {
            const f = async () => {
              if (peripheral) {
                try {
                  console.log("interval triggered");
                  const data = await BleManager.read(
                    peripheral.id,
                    SERVICE_UUID,
                    "2a37"
                  );
                  const bpm = data[1] | (data[0] << 8);
                  console.log(`Received heartbeat ${bpm}`);
                  setHeartbeat(bpm);
                } catch (e) {
                  console.error(e);
                }
              }
            };

            f();
          }, 1000);

        console.log(`interval created: ${intervalId}`);

        listeners = [
          BleManager.onDiscoverPeripheral(async (peripheral: Peripheral) => {
            if (!isConnected) {
              await BleManager.connect(peripheral.id);
              setIsConnected(true);
              setPeripheral(peripheral);
              console.log(`peripheral: ${JSON.stringify(peripheral)}`);

              const peripheralInfo = await BleManager.retrieveServices(
                peripheral.id
              );
              console.log(peripheralInfo);
            }
          }),
          BleManager.onDisconnectPeripheral((peripheral: Peripheral) => {
            console.log(`disconnected: ${JSON.stringify(peripheral)}`);
            setPeripheral(null);
            setIsConnected(false);
            // @ts-expect-error
            clearInterval(intervalId);
            intervalId = null;
          }),
        ];
      } catch (e) {
        console.log("Error starting bluetooth ", e);
      }
    };

    f();

    return () => {
      for (const listener of listeners) {
        listener.remove();
      }

      // @ts-expect-error
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isConnected, peripheral]);

  return (
    <View>
      <BluetoothContext.Provider value={heartbeat}>
        {children}
      </BluetoothContext.Provider>
    </View>
  );
}
