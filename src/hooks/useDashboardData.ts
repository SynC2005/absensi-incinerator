import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useDashboardData() {
  const [machines, setMachines] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [userProfile, setUserProfile] = useState({ name: 'Memuat...', role: 'Memuat...' });
  const [isUploading, setIsUploading] = useState(false);

  // Fungsi Mengambil Data dari Supabase
  const fetchInitialData = async () => {
    setIsLoadingData(true);
    
    // Ambil Mesin
    const { data: machineData } = await supabase
      .from('mesin_incinerator')
      .select('*')
      .order('created_at', { ascending: false });

    if (machineData) {
      setMachines(machineData);
    }

    // Ambil User
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Pengguna';
        const role = user.user_metadata?.role || 'Operator';
        setUserProfile({ name, role });
      }
    } catch (error) {
      console.error("Gagal ambil user:", error);
    }

    setIsLoadingData(false);
  };

  // Jalankan fetch otomatis saat aplikasi dibuka
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fungsi Menyimpan Data ke Database
  const uploadSensorData = async (selectedMachineId: string, weight: number) => {
    if (weight <= 0) throw new Error("Berat tidak valid.");
    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const selectedMachine = machines.find(m => m.id === selectedMachineId);

      const { error } = await supabase
        .from('aktivitas_log')
        .insert([{
          mesin_id: selectedMachineId,
          nama_mesin: selectedMachine?.nama_tempat,
          operator_id: user?.id,
          operator_name: userProfile.name,
          aksi: 'Input Berat',
          keterangan: `${weight.toFixed(2)} kg`
        }]);

      if (error) throw error;
      
      return true; // Berhasil
    } catch (error) {
      console.error("Upload gagal:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { 
    machines, 
    isLoadingData, 
    userProfile, 
    isUploading, 
    uploadSensorData 
  };
}