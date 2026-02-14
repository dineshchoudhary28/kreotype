"use client";

import { useState, useEffect } from "react";

interface Log {
  _id: string;
  type: string;
  message: string;
  data: Record<string, any>;
  userId: string | null;
  important: boolean;
  timestamp: string;
}

export function LogViewer() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("");
  const [limit, setLimit] = useState(25);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      const url = new URL("/api/admin/logs", window.location.origin);
      if (type) url.searchParams.set("type", type);
      if (limit) url.searchParams.set("limit", limit.toString());

      try {
        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs);
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [type, limit]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <select value={type} onChange={(e) => setType(e.target.value)} className="px-4 py-2 bg-background border border-surface rounded-xl">
          <option value="">All Types</option>
          <option value="auth_failure">Auth Failure</option>
          <option value="banned_action">Banned Action</option>
          <option value="admin_action">Admin Action</option>
          <option value="error">Error</option>
          <option value="suspicious_result">Suspicious Result</option>
        </select>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value))}
          className="px-4 py-2 bg-background border border-surface rounded-xl w-24"
        />
      </div>

      {loading && <p>Loading...</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-secondary uppercase">
              <th className="p-2">Timestamp</th>
              <th className="p-2">Type</th>
              <th className="p-2">Message</th>
              <th className="p-2">User ID</th>
              <th className="p-2">Data</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="text-sm border-t border-surface">
                <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-2">{log.type}</td>
                <td className="p-2">{log.message}</td>
                <td className="p-2">{log.userId}</td>
                <td className="p-2">
                  <pre className="text-xs bg-background p-2 rounded">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
