import { useState } from 'react';

// UUID ESP32
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

export function useBluetooth() {
  const [btStatus, setBtStatus] = useState<'Disconnected' | 'Connecting' | 'Connected'>('Disconnected');
  const [btDevice, setBtDevice] = useState<any>(null);
  const [weight, setWeight] = useState<number>(0);

  const connectBluetooth = async () => {
    if (!navigator.bluetooth) {
      alert("Browser ini tidak mendukung Web Bluetooth API.");
      return;
    }

    try {
      setBtStatus('Connecting');
      
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }]
      });

      device.addEventListener('gattserverdisconnected', () => {
        console.log("Bluetooth Terputus!");
        setBtStatus('Disconnected');
        setBtDevice(null);
      });
      
      if (!device.gatt) throw new Error("GATT Server tidak tersedia.");
      
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const decoder = new TextDecoder('utf-8');
        const weightString = decoder.decode(value);
        
        const parsedWeight = parseFloat(weightString);
        if (!isNaN(parsedWeight)) {
          setWeight(parsedWeight);
        }
      });

      setBtDevice(device);
      setBtStatus('Connected');

    } catch (error) {
      console.error("Koneksi Bluetooth Gagal:", error);
      setBtStatus('Disconnected');
      alert("Gagal terhubung ke Timbangan ESP32.");
    }
  };

  const disconnectBluetooth = () => {
    if (btDevice && btDevice.gatt.connected) {
      btDevice.gatt.disconnect();
    }
  };

  // Mengembalikan data dan fungsi yang bisa dipakai oleh file lain
  return { 
    btStatus, 
    weight, 
    connectBluetooth, 
    disconnectBluetooth 
  };
}