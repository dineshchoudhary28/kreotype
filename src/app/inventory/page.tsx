"use client";

import { useState, useEffect } from "react";
import { useUserData } from "@/hooks/use-user-data";
import { badges, type Badge } from "@/data/badges";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const { user, isLoading } = useUserData();
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect -- syncing server data into local state on user load */
  useEffect(() => {
    if (user) {
      setSelectedBadges(user.inventory?.badges ?? []);
      const userEarnedBadges = user.badges.map(b => badges[b.badgeId]).filter(Boolean);
      setEarnedBadges(userEarnedBadges);
    }
  }, [user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleBadgeClick = (badgeId: string) => {
    setSelectedBadges(prev => {
      if (prev.includes(badgeId)) {
        return prev.filter(id => id !== badgeId);
      }
      if (prev.length >= 5) {
        toast.error("You can only equip a maximum of 5 badges.");
        return prev;
      }
      return [...prev, badgeId];
    });
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/users/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badges: selectedBadges }),
      });
      if (res.ok) {
        toast.success("Inventory saved!");
      } else {
        toast.error("Failed to save inventory.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-[1500px] mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Badge Inventory</h1>
      <p className="text-secondary mb-4">Select up to 5 badges to display on your profile.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {earnedBadges.map((badge) => (
          <div
            key={badge.id}
            onClick={() => handleBadgeClick(badge.id)}
            className={cn(
              "p-4 rounded-xl border-2 cursor-pointer transition-all",
              selectedBadges.includes(badge.id)
                ? "border-primary bg-primary/10"
                : "border-surface hover:border-primary/50"
            )}
          >
            <div className="text-4xl mb-2">{badge.icon}</div>
            <h3 className="font-bold">{badge.name}</h3>
            <p className="text-xs text-secondary">{badge.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button onClick={handleSave} className="px-6 py-2 rounded-xl bg-primary text-background font-bold">
          Save Equipped Badges
        </button>
      </div>
    </div>
  );
}
