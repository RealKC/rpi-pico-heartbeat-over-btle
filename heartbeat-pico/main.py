import sys

# ruff: noqa: E402
sys.path.append("")

from micropython import const
from machine import ADC, Pin

import asyncio
import aioble
import bluetooth
import time
import struct

_HEART_RATE_UUID = bluetooth.UUID(0x180D)
_HEART_RATE_SENSOR_UUID = bluetooth.UUID(0x2A37)
_ADV_APPEARANCE_GENERIC_HEART_RATE_SENSOR = const(832)

# How frequently to send advertising beacons.
_ADV_INTERVAL_MS = 250_000


# Register GATT server.
heart_rate_service = aioble.Service(_HEART_RATE_UUID)
bpm_characteristic = aioble.Characteristic(
    heart_rate_service, _HEART_RATE_SENSOR_UUID, read=True, notify=True
)
aioble.register_services(heart_rate_service)


# Helper to encode the temperature characteristic encoding (sint16, hundredths of a degree).
def _encode_bpm(temp_deg_c):
    return struct.pack("<B", int(temp_deg_c))


# based on this blog post https://peppe8o.com/pulse-sensor-with-raspberry-pi-pico-hearth-beat-chech-with-micropython/
async def sensor_task():
    adc = ADC(28)

    max_samples = 2500
    short_average = 15
    long_average = 100
    beat_threshold = 200
    finger_threshold = 20000
    history = []

    last_time = time.ticks_ms()

    beats = 0

    while True:
        v = adc.read_u16()
        history.append(v)
        history = history[-max_samples:]

        current_time = time.ticks_ms()

        if max(history) - min(history) < finger_threshold:
            avg_1 = sum(history[-short_average:]) / short_average
            avg_2 = sum(history[-long_average:]) / long_average

            if avg_1 - avg_2 > beat_threshold:
                beats += 1

        if time.ticks_diff(current_time, last_time) >= 60_000:
            last_time = current_time
            print(f"{beats} bpm")
            bpm_characteristic.write(_encode_bpm(beats), send_update=True)
            beats = 0
            await asyncio.sleep_ms(10)  # yield to other tasks for a bit


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
