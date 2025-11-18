'use client';

import { useEffect, useState } from 'react';
import { loadConfig } from '@/services/dashboardService';

export default function ConfigBadge() {
  const [configText, setConfigText] = useState('Loading...');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await loadConfig();
        const storageType = config.storage_type.toUpperCase();
        let text = storageType;
        
        if (config.storage_type === 's3' && config.bucket) {
          text += ` | ${config.bucket}`;
        }
        
        setConfigText(text);
      } catch {
        setConfigText('Config Error');
      }
    };

    fetchConfig();
  }, []);

  return (
    <div className="bg-teal-100 text-[#009689] px-4 py-2 rounded-full text-sm font-semibold border border-[#009689]">
      {configText}
    </div>
  );
}

