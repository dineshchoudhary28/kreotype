"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SettingControl } from "./SettingControl";
import type { SettingGroupMeta } from "@/core/settings-metadata";
import { getSettingsByGroup } from "@/core/settings-metadata";

export function SettingSection({ group }: { group: SettingGroupMeta }) {
  const [open, setOpen] = useState(true);
  const settings = getSettingsByGroup(group.id);

  if (group.id === "dangerZone" || group.id === "theme") {
    // These are handled specially in the settings page
    return null;
  }

  return (
    <section id={`settings-${group.id}`} className="scroll-mt-20">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full py-3 group"
      >
        <h2 className="text-sm font-medium text-text">{group.label}</h2>
        <span className="text-xs text-secondary">{group.description}</span>
        <ChevronDown
          size={14}
          className={`ml-auto text-secondary transition-transform ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>
      {open && (
        <div className="flex flex-col">
          {settings.map((meta) => (
            <SettingControl key={meta.key} meta={meta} />
          ))}
        </div>
      )}
    </section>
  );
}
