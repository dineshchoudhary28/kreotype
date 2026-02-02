"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type Tab = "account" | "authentication" | "blockedUsers" | "apeKeys" | "dangerZone";

interface BlockedUser {
  _id: string;
  username: string;
}

interface ApeKey {
  _id: string;
  name: string;
  active: boolean;
  createdAt: string;
  lastUsedOn?: string;
}

export default function AccountSettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Account tab
  const [newName, setNewName] = useState("");

  // Auth tab
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Blocked users tab
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  // Ape keys tab
  const [apeKeys, setApeKeys] = useState<ApeKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const clearMessages = () => { setMessage(""); setError(""); };

  const fetchBlockedUsers = useCallback(async () => {
    const res = await fetch("/api/blocked-users");
    if (res.ok) {
      const data = await res.json();
      setBlockedUsers(data.blockedUsers);
    }
  }, []);

  const fetchApeKeys = useCallback(async () => {
    const res = await fetch("/api/ape-keys");
    if (res.ok) {
      const data = await res.json();
      setApeKeys(data.keys);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (activeTab === "blockedUsers") fetchBlockedUsers();
    if (activeTab === "apeKeys") fetchApeKeys();
  }, [activeTab, status, fetchBlockedUsers, fetchApeKeys]);

  const apiAction = async (
    url: string,
    method: string,
    body?: Record<string, unknown>,
    onSuccess?: (data: Record<string, unknown>) => void
  ) => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch(url, {
        method,
        ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Success");
        onSuccess?.(data);
      } else {
        setError(data.error || "Failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "account", label: "account" },
    { id: "authentication", label: "authentication" },
    { id: "blockedUsers", label: "blocked users" },
    { id: "apeKeys", label: "ape keys" },
    { id: "dangerZone", label: "danger zone" },
  ];

  if (status === "loading") {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 font-mono">
        <div className="h-64 rounded bg-secondary bg-opacity-10 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6 px-4 py-8 font-mono">
      {/* Tabs */}
      <div className="flex flex-row md:flex-col gap-1 shrink-0 md:w-48">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); clearMessages(); }}
            className={`px-3 py-2 rounded text-xs text-left transition-all duration-150 ${
              activeTab === tab.id
                ? "bg-primary text-background"
                : "text-secondary hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-6">
        {message && <p className="text-xs text-primary">{message}</p>}
        {error && <p className="text-xs text-error">{error}</p>}

        {activeTab === "account" && (
          <>
            {/* Update name */}
            <section className="flex flex-col gap-2 pb-4 border-b border-secondary border-opacity-10">
              <h3 className="text-sm text-text">update account name</h3>
              <p className="text-xs text-secondary">Change the name of your account. You can only do this once every 30 days.</p>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="new username"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-1.5 bg-background border border-secondary rounded text-text text-xs outline-none focus:border-primary w-48"
                />
                <button
                  onClick={() => apiAction("/api/account/name", "PATCH", { username: newName }, () => setNewName(""))}
                  disabled={loading || !newName.trim()}
                  className="px-4 py-1.5 rounded text-xs bg-primary text-background disabled:opacity-50"
                >
                  update name
                </button>
              </div>
            </section>

            {/* Opt out of leaderboards */}
            <section className="flex flex-col gap-2 pb-4 border-b border-secondary border-opacity-10">
              <h3 className="text-sm text-text">opt out of leaderboards</h3>
              <p className="text-xs text-secondary">{"Use this if you frequently trigger the anticheat to opt out of leaderboards. You can't undo this action!"}</p>
              <div>
                <button
                  onClick={() => { if (confirm("Are you sure? This cannot be undone.")) apiAction("/api/account/leaderboard-opt-out", "POST"); }}
                  disabled={loading}
                  className="px-4 py-1.5 rounded text-xs bg-primary text-background disabled:opacity-50"
                >
                  opt out
                </button>
              </div>
            </section>

            {/* Reset PBs */}
            <section className="flex flex-col gap-2 pb-4 border-b border-secondary border-opacity-10">
              <h3 className="text-sm text-text">reset personal bests</h3>
              <p className="text-xs text-secondary">{"Resets all your personal bests (but doesn't delete any tests from your history). You can't undo this!"}</p>
              <div>
                <button
                  onClick={() => { if (confirm("Reset all personal bests?")) apiAction("/api/users/me/personal-bests", "DELETE"); }}
                  disabled={loading}
                  className="px-4 py-1.5 rounded text-xs bg-primary text-background disabled:opacity-50"
                >
                  reset personal bests
                </button>
              </div>
            </section>
          </>
        )}

        {activeTab === "authentication" && (
          <>
            {/* Update password */}
            <section className="flex flex-col gap-2 pb-4 border-b border-secondary border-opacity-10">
              <h3 className="text-sm text-text">password authentication settings</h3>
              <p className="text-xs text-secondary">Update your password.</p>
              <div className="flex flex-col gap-2 max-w-xs">
                <input
                  type="password"
                  placeholder="current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="px-3 py-1.5 bg-background border border-secondary rounded text-text text-xs outline-none focus:border-primary"
                />
                <input
                  type="password"
                  placeholder="new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="px-3 py-1.5 bg-background border border-secondary rounded text-text text-xs outline-none focus:border-primary"
                />
                <button
                  onClick={() => apiAction("/api/account/password", "PATCH", { oldPassword, newPassword }, () => { setOldPassword(""); setNewPassword(""); })}
                  disabled={loading || !oldPassword || !newPassword}
                  className="px-4 py-1.5 rounded text-xs bg-primary text-background disabled:opacity-50 w-fit"
                >
                  update password
                </button>
              </div>
            </section>

            {/* Google auth */}
            <section className="flex flex-col gap-2 pb-4 border-b border-secondary border-opacity-10">
              <h3 className="text-sm text-text">google authentication settings</h3>
              <p className="text-xs text-secondary">Add or remove Google authentication.</p>
              <div>
                <button
                  onClick={() => signIn("google")}
                  className="px-4 py-1.5 rounded text-xs bg-primary text-background"
                >
                  add google auth
                </button>
              </div>
            </section>

            {/* GitHub auth */}
            <section className="flex flex-col gap-2 pb-4 border-b border-secondary border-opacity-10">
              <h3 className="text-sm text-text">github authentication settings</h3>
              <p className="text-xs text-secondary">Add or remove GitHub authentication.</p>
              <div>
                <button
                  onClick={() => signIn("github")}
                  className="px-4 py-1.5 rounded text-xs bg-primary text-background"
                >
                  add github auth
                </button>
              </div>
            </section>
          </>
        )}

        {activeTab === "blockedUsers" && (
          <section>
            <h3 className="text-sm text-text mb-2">blocked users</h3>
            <p className="text-xs text-secondary mb-4">Blocked users cannot send you friend requests.</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-secondary border-b border-secondary border-opacity-20">
                  <td className="py-2">name</td>
                  <td className="py-2"></td>
                </tr>
              </thead>
              <tbody>
                {blockedUsers.length === 0 ? (
                  <tr className="text-secondary text-center">
                    <td colSpan={2} className="py-6">No blocked users.</td>
                  </tr>
                ) : (
                  blockedUsers.map((u) => (
                    <tr key={u._id} className="text-text border-b border-secondary border-opacity-10">
                      <td className="py-2">{u.username}</td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => apiAction(`/api/blocked-users?userId=${u._id}`, "DELETE", undefined, () => {
                            setBlockedUsers((prev) => prev.filter((b) => b._id !== u._id));
                          })}
                          disabled={loading}
                          className="text-secondary hover:text-text transition-colors disabled:opacity-50"
                        >
                          unblock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === "apeKeys" && (
          <section>
            <h3 className="text-sm text-text mb-2">ape keys</h3>
            <p className="text-xs text-secondary mb-4">Generate Ape Keys to access certain API endpoints.</p>

            {generatedKey && (
              <div className="mb-4 p-3 rounded border border-primary bg-primary bg-opacity-5">
                <p className="text-xs text-primary mb-1">Key generated — copy it now, it won{"'"}t be shown again:</p>
                <code className="text-xs text-text break-all select-all">{generatedKey}</code>
              </div>
            )}

            <div className="flex gap-2 items-center mb-4">
              <input
                type="text"
                placeholder="key name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="px-3 py-1.5 bg-background border border-secondary rounded text-text text-xs outline-none focus:border-primary w-48"
              />
              <button
                onClick={() => apiAction("/api/ape-keys", "POST", { name: newKeyName }, (data) => {
                  const key = data.key as { rawKey: string };
                  setGeneratedKey(key.rawKey);
                  setNewKeyName("");
                  fetchApeKeys();
                })}
                disabled={loading || !newKeyName.trim()}
                className="px-4 py-1.5 rounded text-xs bg-primary text-background disabled:opacity-50"
              >
                generate new key
              </button>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="text-secondary border-b border-secondary border-opacity-20">
                  <td className="py-2">active</td>
                  <td className="py-2">name</td>
                  <td className="py-2">created on</td>
                  <td className="py-2"></td>
                </tr>
              </thead>
              <tbody>
                {apeKeys.length === 0 ? (
                  <tr className="text-secondary text-center">
                    <td colSpan={4} className="py-6">No API keys.</td>
                  </tr>
                ) : (
                  apeKeys.map((k) => (
                    <tr key={k._id} className="text-text border-b border-secondary border-opacity-10">
                      <td className="py-2">
                        <button
                          onClick={() => apiAction(`/api/ape-keys/${k._id}`, "PATCH", { active: !k.active }, () => {
                            setApeKeys((prev) => prev.map((key) =>
                              key._id === k._id ? { ...key, active: !key.active } : key
                            ));
                          })}
                          disabled={loading}
                          className={`w-3 h-3 rounded-full ${k.active ? "bg-primary" : "bg-secondary bg-opacity-30"}`}
                          title={k.active ? "Active — click to deactivate" : "Inactive — click to activate"}
                        />
                      </td>
                      <td className="py-2">{k.name}</td>
                      <td className="py-2 text-secondary">
                        {new Date(k.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => { if (confirm("Delete this key?")) apiAction(`/api/ape-keys/${k._id}`, "DELETE", undefined, () => {
                            setApeKeys((prev) => prev.filter((key) => key._id !== k._id));
                          }); }}
                          disabled={loading}
                          className="text-secondary hover:text-error transition-colors disabled:opacity-50"
                        >
                          delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === "dangerZone" && (
          <>
            {/* Reset account */}
            <section className="flex flex-col gap-2 pb-4 border-b border-secondary border-opacity-10">
              <h3 className="text-sm text-text">reset account</h3>
              <p className="text-xs text-secondary">{"Completely resets your account to a blank state. You can't undo this action!"}</p>
              <div>
                {resetConfirm ? (
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-error">Are you sure?</span>
                    <button
                      onClick={() => apiAction("/api/account/reset", "POST", undefined, () => setResetConfirm(false))}
                      disabled={loading}
                      className="px-4 py-1.5 rounded text-xs bg-[var(--error)] text-background disabled:opacity-50"
                    >
                      yes, reset
                    </button>
                    <button
                      onClick={() => setResetConfirm(false)}
                      className="px-4 py-1.5 rounded text-xs text-secondary"
                    >
                      cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setResetConfirm(true)}
                    className="px-4 py-1.5 rounded text-xs bg-[var(--error)] text-background"
                  >
                    reset account
                  </button>
                )}
              </div>
            </section>

            {/* Delete account */}
            <section className="flex flex-col gap-2 pb-4 border-b border-secondary border-opacity-10">
              <h3 className="text-sm text-text">delete account</h3>
              <p className="text-xs text-secondary">{"Deletes your account and all data connected to it. You can't undo this action!"}</p>
              <div>
                {deleteConfirm ? (
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-error">This is permanent!</span>
                    <button
                      onClick={() => apiAction("/api/account/delete", "POST", undefined, () => {
                        signOut({ callbackUrl: "/" });
                      })}
                      disabled={loading}
                      className="px-4 py-1.5 rounded text-xs bg-[var(--error)] text-background disabled:opacity-50"
                    >
                      yes, delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="px-4 py-1.5 rounded text-xs text-secondary"
                    >
                      cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="px-4 py-1.5 rounded text-xs bg-[var(--error)] text-background"
                  >
                    delete account
                  </button>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
