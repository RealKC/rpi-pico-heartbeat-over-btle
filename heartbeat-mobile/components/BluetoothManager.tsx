import React from "react";
import { useEffect, useState } from "react";
import { EventSubscription, View } from "react-native";
import BleManager, {
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from "react-native-ble-manager";

export const BluetoothContext = React.createContext<number | null>(null);

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
          }),
        ];

        intervalId = setInterval(() => {
          const f = async () => {
            if (peripheral) {
              try {
                const data = await BleManager.read(
                  peripheral.id,
                  SERVICE_UUID,
                  "2a37"
                );
                setHeartbeat(data[0]);
              } catch (e) {
                console.error(e);
              }
            }
          };

          f();
        }, 1000);
      } catch (e) {
        console.log("Error starting bluetooth", e);
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
  }, []);

  return (
    <View>
      <BluetoothContext.Provider value={heartbeat}>
        {children}
      </BluetoothContext.Provider>
    </View>
  );
}
