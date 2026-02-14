"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TagManager } from "@/components/features/account/TagManager";
import { 
  User, 
  Shield, 
  Users, 
  Check, 
  AlertTriangle,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "account" | "authentication" | "blockedUsers" | "tags";

interface BlockedUser {
  _id: string;
  username: string;
}

export default function AccountSettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Account tab
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [keyboard, setKeyboard] = useState("");
  const [socialProfiles, setSocialProfiles] = useState({ twitter: "", github: "", website: "" });

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/users/me")
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setDisplayName(data.user.name || "");
            setUsername(data.user.username || "");
            setBio(data.user.profileDetails?.bio ?? "");
            setKeyboard(data.user.profileDetails?.keyboard ?? "");
            setSocialProfiles(data.user.profileDetails?.socialProfiles ?? { twitter: "", github: "", website: "" });
          }
        });
    }
  }, [status]);

  // Auth tab
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showResetFlow, setShowResetFlow] = useState(false);

  // Blocked users tab
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

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

  useEffect(() => {
    if (status !== "authenticated") return;
    if (activeTab === "blockedUsers") fetchBlockedUsers();
  }, [activeTab, status, fetchBlockedUsers]);

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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "account", label: "account", icon: <User size={14} /> },
    { id: "authentication", label: "authentication", icon: <Shield size={14} /> },
    { id: "blockedUsers", label: "blocked users", icon: <Users size={14} /> },
    { id: "tags", label: "tags", icon: <Tag size={14} /> },
  ];

  if (status === "loading") {
    return (
      <div className="w-full max-w-5xl mx-auto px-6 py-12">
        <div className="h-64 rounded-3xl bg-surface animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1500px] mx-auto flex flex-col md:flex-row gap-8 px-6 py-12">
      {/* Sidebar Tabs */}
      <div className="flex flex-row md:flex-col gap-1 shrink-0 md:w-56 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); clearMessages(); }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest text-left transition-all duration-200 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-primary text-background shadow-lg shadow-primary/20"
                : "text-secondary hover:text-text hover:bg-surface/50"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-8">
        <div className="flex flex-col gap-2 mb-2">
           <h1 className="text-2xl font-bold text-text tracking-tight capitalize">
             {tabs.find(t => t.id === activeTab)?.label} Settings
           </h1>
           <p className="text-secondary text-sm">Manage your profile and security preferences.</p>
        </div>

        {message && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3 text-primary text-xs font-bold animate-in fade-in slide-in-from-top-2">
            <Check size={16} />
            {message}
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-2xl flex items-center gap-3 text-error text-xs font-bold animate-in fade-in slide-in-from-top-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-6">
            <SettingsCard
              title="display name"
              description="This is your name shown on your profile and leaderboards. It doesn't have to be unique."
            >
              <div className="flex gap-3 items-center mt-2">
                <input
                  type="text"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 max-w-xs px-4 py-2.5 bg-background border border-surface rounded-xl text-text text-sm outline-none focus:border-primary transition-all"
                />
                <button
                  onClick={() => apiAction("/api/account/name", "PATCH", { name: displayName })}
                  disabled={loading || !displayName.trim()}
                  className="px-6 py-2.5 rounded-xl bg-primary text-background text-xs font-bold disabled:opacity-50 hover:opacity-90 transition-all cursor-pointer"
                >
                  Update Name
                </button>
              </div>
            </SettingsCard>

            <SettingsCard
              title="username"
              description="Your unique handle. You can only change this once every 30 days."
            >
              <div className="flex gap-3 items-center mt-2">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 max-w-xs px-4 py-2.5 bg-background border border-surface rounded-xl text-text text-sm outline-none focus:border-primary transition-all"
                />
                <button
                  onClick={() => apiAction("/api/account/name", "PATCH", { username })}
                  disabled={loading || !username.trim()}
                  className="px-6 py-2.5 rounded-xl bg-primary text-background text-xs font-bold disabled:opacity-50 hover:opacity-90 transition-all cursor-pointer"
                >
                  Update Handle
                </button>
              </div>
            </SettingsCard>

            <SettingsCard
              title="profile details"
              description="Add some more information about yourself."
            >
              <div className="flex flex-col gap-4 mt-2">
                <textarea
                  placeholder="Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-surface rounded-xl text-text text-sm outline-none focus:border-primary transition-all"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Keyboard"
                  value={keyboard}
                  onChange={(e) => setKeyboard(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-surface rounded-xl text-text text-sm outline-none focus:border-primary transition-all"
                />
                <input
                  type="text"
                  placeholder="Twitter URL"
                  value={socialProfiles.twitter}
                  onChange={(e) => setSocialProfiles({ ...socialProfiles, twitter: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-surface rounded-xl text-text text-sm outline-none focus:border-primary transition-all"
                />
                <input
                  type="text"
                  placeholder="GitHub URL"
                  value={socialProfiles.github}
                  onChange={(e) => setSocialProfiles({ ...socialProfiles, github: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-surface rounded-xl text-text text-sm outline-none focus:border-primary transition-all"
                />
                <input
                  type="text"
                  placeholder="Website URL"
                  value={socialProfiles.website}
                  onChange={(e) => setSocialProfiles({ ...socialProfiles, website: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-surface rounded-xl text-text text-sm outline-none focus:border-primary transition-all"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => apiAction("/api/users/profile", "PATCH", { bio, keyboard, socialProfiles })}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-primary text-background text-xs font-bold disabled:opacity-50 hover:opacity-90 transition-all cursor-pointer"
                  >
                    Update Profile
                  </button>
                </div>
              </div>
            </SettingsCard>

            <SettingsCard
              title="privacy"
              description="Manage how your account appears to others on leaderboards."
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-surface/50">
                  <div>
                    <h4 className="text-sm font-bold text-text mb-1">Opt out of leaderboards</h4>
                    <p className="text-xs text-secondary italic">This action is permanent and cannot be reversed.</p>
                  </div>
                  <button
                    onClick={() => { if (confirm("Are you sure? This cannot be undone.")) apiAction("/api/account/leaderboard-opt-out", "POST"); }}
                    disabled={loading}
                    className="px-6 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-text text-xs font-bold transition-all border border-surface cursor-pointer"
                  >
                    Opt Out
                  </button>
                </div>
              </div>
            </SettingsCard>

            <SettingsCard
              title="personal bests"
              description="Reset your records across all modes. This will not affect your test history."
            >
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-surface/50">
                <div>
                  <h4 className="text-sm font-bold text-text mb-1">Clear all PBs</h4>
                  <p className="text-xs text-secondary">Start fresh with new records.</p>
                </div>
                <button
                  onClick={() => { if (confirm("Reset all personal bests?")) apiAction("/api/users/me/personal-bests", "DELETE"); }}
                  disabled={loading}
                  className="px-6 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-text text-xs font-bold transition-all border border-surface cursor-pointer"
                >
                  Reset PBs
                </button>
              </div>
            </SettingsCard>
          </div>
        )}

        {activeTab === "authentication" && (
          <div className="space-y-6">
            <SettingsCard
              title="change password"
              description="Ensure your account is secure by using a strong password."
            >
              {!showResetFlow ? (
                <div className="flex flex-col gap-3 max-w-sm mt-2">
                  <input
                    type="password"
                    placeholder="Current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-surface rounded-xl text-text text-sm outline-none focus:border-primary transition-all"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-surface rounded-xl text-text text-sm outline-none focus:border-primary transition-all"
                  />
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => apiAction("/api/account/password", "PATCH", { oldPassword, newPassword }, () => { setOldPassword(""); setNewPassword(""); })}
                      disabled={loading || !oldPassword || !newPassword}
                      className="px-8 py-2.5 rounded-xl bg-primary text-background text-xs font-bold disabled:opacity-50 hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/10"
                    >
                      Update Password
                    </button>
                    <button
                      onClick={() => setShowResetFlow(true)}
                      className="text-xs font-bold text-secondary hover:text-primary transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-w-sm mt-2">
                  {!otpSent ? (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col gap-3">
                      <p className="text-xs text-secondary">We'll send a verification code to your email to reset your password.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => apiAction("/api/auth/otp/request", "POST", { email: username, type: "reset" }, () => setOtpSent(true))}
                          disabled={loading}
                          className="px-6 py-2 rounded-lg bg-primary text-background text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
                        >
                          Send Code
                        </button>
                        <button
                          onClick={() => setShowResetFlow(false)}
                          className="px-6 py-2 rounded-lg bg-surface border border-surface text-secondary text-xs font-bold hover:text-text transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">Verification Code</label>
                        <input
                          type="text"
                          placeholder="123456"
                          value={resetOtp}
                          onChange={(e) => setResetOtp(e.target.value)}
                          className="w-full px-4 py-2.5 bg-background border border-surface rounded-xl text-text text-sm outline-none focus:border-primary transition-all text-center tracking-[0.5em] font-bold"
                          maxLength={6}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">New Password</label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2.5 bg-background border border-surface rounded-xl text-text text-sm outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => apiAction("/api/auth/reset-password", "POST", { identifier: username, otp: resetOtp, newPassword }, () => {
                            setShowResetFlow(false);
                            setOtpSent(false);
                            setResetOtp("");
                            setNewPassword("");
                          })}
                          disabled={loading || !resetOtp || !newPassword}
                          className="px-8 py-2.5 rounded-xl bg-primary text-background text-xs font-bold disabled:opacity-50 hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/10"
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => { setOtpSent(false); setResetOtp(""); }}
                          className="px-6 py-2.5 rounded-xl bg-surface border border-surface text-secondary text-xs font-bold hover:text-text transition-all cursor-pointer"
                        >
                          Back
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </SettingsCard>

            <SettingsCard
              title="third-party accounts"
              description="Link social accounts for faster sign-in."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => signIn("google")}
                  className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all text-sm cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
              </div>
            </SettingsCard>
          </div>
        )}

        {activeTab === "blockedUsers" && (
          <SettingsCard
            title="blocked users"
            description="Users you block will not be able to interact with you or send friend requests."
          >
            <div className="overflow-hidden rounded-2xl border border-surface/30 bg-background/50">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface/50 text-[10px] font-bold text-secondary uppercase tracking-widest">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/30">
                  {blockedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-secondary text-xs italic">
                        No blocked users.
                      </td>
                    </tr>
                  ) : (
                    blockedUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-surface/20 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-text">{u.username}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => apiAction(`/api/blocked-users?userId=${u._id}`, "DELETE", undefined, () => {
                              setBlockedUsers((prev) => prev.filter((b) => b._id !== u._id));
                            })}
                            disabled={loading}
                            className="text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-text transition-all disabled:opacity-50"
                          >
                            Unblock
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SettingsCard>
        )}

        {activeTab === "tags" && <TagManager />}
      </div>
    </div>
  );
}

function SettingsCard({ 
  title, 
  description, 
  children, 
  danger 
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section className={cn(
      "rounded-3xl border p-6 flex flex-col gap-4 shadow-sm",
      danger ? "border-error/20 bg-error/[0.02]" : "border-surface/50 bg-surface"
    )}>
      <div className="flex flex-col gap-1">
        <h3 className={cn(
          "text-[11px] font-bold uppercase tracking-widest",
          danger ? "text-error" : "text-secondary"
        )}>
          {title}
        </h3>
        <p className="text-secondary text-xs">{description}</p>
      </div>
      <div className="mt-1">
        {children}
      </div>
    </section>
  );
}