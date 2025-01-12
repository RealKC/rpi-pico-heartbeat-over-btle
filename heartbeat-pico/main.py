import sys

# ruff: noqa: E402
sys.path.append("")

from micropython import const

import asyncio
import aioble
import bluetooth

import random
import struct

_HEART_RATE_UUID = bluetooth.UUID(0x180D)
_HEART_RATE_SENSOR_UUID = bluetooth.UUID(0x2A37)
_ADV_APPEARANCE_GENERIC_HEART_RATE_SENSOR = const(832)

# How frequently to send advertising beacons.
_ADV_INTERVAL_MS = 250_000


# Register GATT server.
heart_rate_service = aioble.Service(_HEART_RATE_UUID)
temp_characteristic = aioble.Characteristic(
    heart_rate_service, _HEART_RATE_SENSOR_UUID, read=True, notify=True
)
aioble.register_services(heart_rate_service)


# Helper to encode the temperature characteristic encoding (sint16, hundredths of a degree).
def _encode_temperature(temp_deg_c):
    return struct.pack("<h", int(temp_deg_c * 100))


# This would be periodically polling a hardware sensor.
async def sensor_task():
    t = 24.5
    while True:
        temp_characteristic.write(_encode_temperature(t), send_update=True)
        t += random.uniform(-0.5, 0.5)
        await asyncio.sleep_ms(1000)


# Serially wait for connections. Don't advertise while a central is
# connected.
async def peripheral_task():
    while True:
        async with await aioble.advertise(
            _ADV_INTERVAL_MS,
            name="Pico Heartbeat",
            services=[_HEART_RATE_UUID],
            appearance=_ADV_APPEARANCE_GENERIC_HEART_RATE_SENSOR,
        ) as connection:  # type: ignore
            print("Connection from", connection.device)
            await connection.disconnected(timeout_ms=None)


# Run both tasks.
async def main():
    t1 = asyncio.create_task(sensor_task())
    t2 = asyncio.create_task(peripheral_task())
    await asyncio.gather(t1, t2)


asyncio.run(main())
