"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface FriendRequest {
  _id: string;
  from: { username: string; image: string };
  status: string;
}

interface Friend {
  _id: string;
  username: string;
  image: string;
  testsCompleted: number;
  timeTyping: number;
  personalBests: Record<string, { wpm: number }>;
  createdAt: string;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function friendsSince(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month" : `${months} months`;
}

export default function FriendsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [addPrompt, setAddPrompt] = useState(false);
  const [addUsername, setAddUsername] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, friendRes] = await Promise.all([
        fetch("/api/friends/requests"),
        fetch("/api/friends"),
      ]);
      if (reqRes.ok) {
        const { requests: r } = await reqRes.json();
        setRequests(r);
      }
      if (friendRes.ok) {
        const { friends: f } = await friendRes.json();
        setFriends(f);
      }
    } catch (err) {
      console.error("Failed to fetch friends:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") fetchAll();
  }, [status, router, fetchAll]);

  const handleRequest = async (requestId: string, action: "accept" | "reject") => {
    setActionLoading(requestId);
    try {
      const res = await fetch("/api/friends/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      if (res.ok) {
        await fetchAll();
      } else {
        const data = await res.json();
        setError(data.error || "Failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddFriend = async () => {
    if (!addUsername.trim()) return;
    setError("");
    setActionLoading("add");
    try {
      const res = await fetch("/api/friends/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: addUsername.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddPrompt(false);
        setAddUsername("");
      } else {
        setError(data.error || "Failed to send request");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm("Remove this friend?")) return;
    setActionLoading(friendId);
    try {
      const res = await fetch(`/api/friends/${friendId}`, { method: "DELETE" });
      if (res.ok) {
        setFriends((prev) => prev.filter((f) => f._id !== friendId));
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded bg-secondary bg-opacity-10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 px-4 py-8">
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}

      {/* Incoming Requests */}
      <section>
        <h2 className="text-base text-primary mb-3">Incoming Requests</h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-secondary border-b border-secondary border-opacity-20">
              <td className="py-2">user</td>
              <td className="py-2">date</td>
              <td className="py-2"></td>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr className="text-secondary text-center">
                <td colSpan={3} className="py-6">No incoming requests.</td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req._id} className="text-text border-b border-secondary border-opacity-10">
                  <td className="py-2">{req.from.username}</td>
                  <td className="py-2 text-secondary">pending</td>
                  <td className="py-2 flex gap-2 justify-end">
                    <button
                      onClick={() => handleRequest(req._id, "accept")}
                      disabled={actionLoading === req._id}
                      className="px-2 py-1 rounded bg-primary text-background text-xs disabled:opacity-50"
                    >
                      accept
                    </button>
                    <button
                      onClick={() => handleRequest(req._id, "reject")}
                      disabled={actionLoading === req._id}
                      className="px-2 py-1 rounded bg-secondary bg-opacity-20 text-secondary text-xs disabled:opacity-50"
                    >
                      reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Friends */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base text-primary">Friends</h2>
          {addPrompt ? (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="username"
                value={addUsername}
                onChange={(e) => setAddUsername(e.target.value)}
                className="px-2 py-1 bg-background border border-secondary rounded text-text text-xs outline-none focus:border-primary"
                onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
              />
              <button
                onClick={handleAddFriend}
                disabled={actionLoading === "add"}
                className="px-2 py-1 rounded bg-primary text-background text-xs disabled:opacity-50"
              >
                send
              </button>
              <button
                onClick={() => { setAddPrompt(false); setAddUsername(""); }}
                className="px-2 py-1 rounded text-xs text-secondary"
              >
                cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddPrompt(true)}
              className="px-3 py-1.5 rounded text-xs bg-primary text-background transition-all duration-150 hover:scale-105 active:scale-95"
            >
              add friend
            </button>
          )}
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-secondary border-b border-secondary border-opacity-20">
              <td className="py-2">name</td>
              <td className="py-2">friends for</td>
              <td className="py-2">tests</td>
              <td className="py-2">time typing</td>
              <td className="py-2">time 15 pb</td>
              <td className="py-2">time 60 pb</td>
              <td className="py-2"></td>
            </tr>
          </thead>
          <tbody>
            {friends.length === 0 ? (
              <tr className="text-secondary text-center">
                <td colSpan={7} className="py-8">
                  {"You don't have any friends :("}
                </td>
              </tr>
            ) : (
              friends.map((f) => (
                <tr key={f._id} className="text-text border-b border-secondary border-opacity-10">
                  <td className="py-2">{f.username}</td>
                  <td className="py-2 text-secondary">{friendsSince(f.createdAt)}</td>
                  <td className="py-2">{f.testsCompleted}</td>
                  <td className="py-2">{formatTime(f.timeTyping)}</td>
                  <td className="py-2">
                    {f.personalBests?.["time|15"] ? `${Math.round(f.personalBests["time|15"].wpm)}` : "-"}
                  </td>
                  <td className="py-2">
                    {f.personalBests?.["time|60"] ? `${Math.round(f.personalBests["time|60"].wpm)}` : "-"}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleRemoveFriend(f._id)}
                      disabled={actionLoading === f._id}
                      className="text-secondary hover:text-error transition-colors disabled:opacity-50"
                    >
                      remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
