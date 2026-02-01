"use client";

import { useState } from "react";

type Tab = "account" | "authentication" | "blockedUsers" | "apeKeys" | "dangerZone";

export default function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");

  const tabs: { id: Tab; label: string }[] = [
    { id: "account", label: "account" },
    { id: "authentication", label: "authentication" },
    { id: "blockedUsers", label: "blocked users" },
    { id: "apeKeys", label: "ape keys" },
    { id: "dangerZone", label: "danger zone" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6 px-4 py-8 font-mono">
      {/* Tabs */}
      <div className="flex flex-row md:flex-col gap-1 shrink-0 md:w-48">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
        {activeTab === "account" && (
          <>
            <SettingSection
              title="update account name"
              description="Change the name of your account. You can only do this once every 30 days."
              buttonLabel="update name"
            />
            <SettingSection
              title="set streak hour offset"
              description="Streaks reset at midnight UTC by default. You can change the hour offset here. You can only do this once!"
              buttonLabel="update hour offset"
            />
            <SettingSection
              title="opt out of leaderboards"
              description="Use this if you frequently trigger the anticheat to opt out of leaderboards. You can't undo this action!"
              buttonLabel="opt out"
            />
            <SettingSection
              title="reset personal bests"
              description="Resets all your personal bests (but doesn't delete any tests from your history). You can't undo this!"
              buttonLabel="reset personal bests"
            />
          </>
        )}

        {activeTab === "authentication" && (
          <>
            <SettingSection
              title="password authentication settings"
              description="Add password authentication, update your password or email."
              buttonLabel="update password"
            />
            <SettingSection
              title="google authentication settings"
              description="Add or remove Google authentication."
              buttonLabel="add google auth"
            />
            <SettingSection
              title="github authentication settings"
              description="Add or remove GitHub authentication."
              buttonLabel="add github auth"
            />
            <SettingSection
              title="revoke all tokens"
              description="Revokes all tokens connected to your account. This will log you out of all devices."
              buttonLabel="revoke all tokens"
              danger
            />
          </>
        )}

        {activeTab === "blockedUsers" && (
          <section>
            <h3 className="text-sm text-text mb-2">blocked users</h3>
            <p className="text-xs text-secondary mb-4">
              Blocked users cannot send you friend requests.
            </p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-secondary border-b border-secondary border-opacity-20">
                  <td className="py-2">name</td>
                  <td className="py-2">blocked on</td>
                  <td className="py-2"></td>
                </tr>
              </thead>
              <tbody>
                <tr className="text-secondary text-center">
                  <td colSpan={3} className="py-6">No blocked users.</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {activeTab === "apeKeys" && (
          <section>
            <h3 className="text-sm text-text mb-2">ape keys</h3>
            <p className="text-xs text-secondary mb-4">
              Generate Ape Keys to access certain API endpoints.
            </p>
            <button className="px-4 py-1.5 rounded text-xs bg-primary text-background">
              generate new key
            </button>
            <table className="w-full text-xs mt-4">
              <thead>
                <tr className="text-secondary border-b border-secondary border-opacity-20">
                  <td className="py-2">active</td>
                  <td className="py-2">name</td>
                  <td className="py-2">created on</td>
                  <td className="py-2">last used on</td>
                  <td className="py-2"></td>
                </tr>
              </thead>
              <tbody>
                <tr className="text-secondary text-center">
                  <td colSpan={5} className="py-6">No API keys.</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {activeTab === "dangerZone" && (
          <>
            <SettingSection
              title="reset account"
              description="Completely resets your account to a blank state. You can't undo this action!"
              buttonLabel="reset account"
              danger
            />
            <SettingSection
              title="delete account"
              description="Deletes your account and all data connected to it. You can't undo this action!"
              buttonLabel="delete account"
              danger
            />
          </>
        )}
      </div>
    </div>
  );
}

function SettingSection({
  title,
  description,
  buttonLabel,
  danger,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  danger?: boolean;
}) {
  return (
    <section className="flex flex-col gap-2 pb-4 border-b border-secondary border-opacity-10">
      <h3 className="text-sm text-text">{title}</h3>
      <p className="text-xs text-secondary">{description}</p>
      <div>
        <button
          className={`px-4 py-1.5 rounded text-xs transition-opacity hover:opacity-90 ${
            danger
              ? "bg-[var(--error)] text-background"
              : "bg-primary text-background"
          }`}
        >
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}
