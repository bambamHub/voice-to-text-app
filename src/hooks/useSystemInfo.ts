import { useState, useEffect } from "react";
import { getSystemInfo, SystemInfo } from "../services/tauriCommands";

export const useSystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const info = await getSystemInfo();
        setSystemInfo(info);
        setError(null);
      } catch (err) {
        setError("Failed to get system information");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemInfo();
  }, []);

  return { systemInfo, loading, error };
};
