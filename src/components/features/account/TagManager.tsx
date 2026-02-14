"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Tag as TagIcon } from "lucide-react";

interface Tag {
  _id: string;
  name: string;
  color: string;
  personalBests?: Map<string, { wpm: number; accuracy: number }>;
}

export function TagManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTags() {
      setLoading(true);
      try {
        const res = await fetch("/api/users/me/tags");
        if (res.ok) {
          const data = await res.json();
          setTags(data.tags);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTags();
  }, []);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const res = await fetch("/api/users/me/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName }),
      });
      if (res.ok) {
        const data = await res.json();
        setTags([data.tag, ...tags]);
        setNewTagName("");
        toast.success("Tag created");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create tag");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    try {
      const res = await fetch(`/api/tags/${tagId}`, { method: "DELETE" });
      if (res.ok) {
        setTags(tags.filter(t => t._id !== tagId));
        toast.success("Tag deleted");
      } else {
        toast.error("Failed to delete tag");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="New tag name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          className="px-4 py-2 bg-background border border-surface rounded-xl"
        />
        <button onClick={handleCreateTag} className="px-4 py-2 bg-primary text-background rounded-xl">
          Create Tag
        </button>
      </div>

      <div className="space-y-2">
        {tags.map(tag => (
          <div key={tag._id} className="flex items-center justify-between p-2 rounded-lg bg-surface">
            <div className="flex items-center gap-2">
              <TagIcon size={14} style={{ color: tag.color }} />
              <span>{tag.name}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              {tag.personalBests && (
                <>
                  <span>15s: {tag.personalBests.get("time|15")?.wpm ?? "-"} wpm</span>
                  <span>60s: {tag.personalBests.get("time|60")?.wpm ?? "-"} wpm</span>
                </>
              )}
              <button onClick={() => handleDeleteTag(tag._id)} className="text-secondary hover:text-error">
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
