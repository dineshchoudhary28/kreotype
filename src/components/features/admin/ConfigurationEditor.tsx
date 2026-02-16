"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export function ConfigurationEditor() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/configuration");
        if (res.ok) {
          const data = await res.json();
          setConfig(data.configuration);
        }
      } catch (err) {
        console.error("Failed to fetch config:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/configuration", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        toast.success("Configuration saved");
      } else {
        toast.error("Failed to save configuration");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !config) {
    return <p>Loading configuration...</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={config.maintenance}
            onChange={(e) => setConfig({ ...config, maintenance: e.target.checked })}
          />
          <span className="ml-2">Maintenance Mode</span>
        </label>
      </div>
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={config.registrationEnabled}
            onChange={(e) => setConfig({ ...config, registrationEnabled: e.target.checked })}
          />
          <span className="ml-2">Registration Enabled</span>
        </label>
      </div>
      
      {/* Add more config options as needed */}

      <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded-xl bg-primary text-background text-sm font-bold">
        {loading ? "Saving..." : "Save Configuration"}
      </button>
    </div>
  );
}
