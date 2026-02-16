"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { LogViewer } from "@/components/features/admin/LogViewer";
import { ConfigurationEditor } from "@/components/features/admin/ConfigurationEditor";
import { User, BookText, Settings } from "lucide-react";

type Tab = "users" | "logs" | "configuration";

export default function AdminPage() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [username, setUsername] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "users", label: "Users", icon: <User size={14} /> },
    { id: "logs", label: "Logs", icon: <BookText size={14} /> },
    { id: "configuration", label: "Configuration", icon: <Settings size={14} /> },
  ];

  const handleSearch = async () => {
    if (!username) return;
    setLoading(true);
    setError("");
    setUser(null);
    try {
      const res = await fetch(`/api/users/${username}`);
      if (!res.ok) {
        throw new Error("User not found");
      }
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user._id}/ban`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to ban user");
      setUser({ ...user, banned: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user._id}/unban`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to unban user");
      setUser({ ...user, banned: false });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <div>Forbidden</div>;
  }

  return (
    <div className="w-full max-w-[1500px] mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      
      <div className="flex border-b border-surface mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-secondary hover:text-text"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-2 bg-background border border-surface rounded-xl text-text text-sm outline-none focus:border-primary transition-all"
            />
            <button onClick={handleSearch} disabled={loading} className="px-4 py-2 rounded-xl bg-primary text-background text-sm font-bold">
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {user && (
            <div>
              <h2 className="text-xl font-bold">{user.username}</h2>
              <p>Status: {user.banned ? "Banned" : "Active"}</p>
              <div className="flex gap-2 mt-2">
                {!user.banned ? (
                  <button onClick={handleBan} disabled={loading} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold">
                    {loading ? "Banning..." : "Ban"}
                  </button>
                ) : (
                  <button onClick={handleUnban} disabled={loading} className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-bold">
                    {loading ? "Unbanning..." : "Unban"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "logs" && <LogViewer />}

      {activeTab === "configuration" && <ConfigurationEditor />}
    </div>
  );
}
