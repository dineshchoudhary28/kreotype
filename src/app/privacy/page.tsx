"use client";

import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-surface pb-8">
        <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-3">
          <ShieldCheck className="text-primary" size={32} strokeWidth={2.5} />
          Privacy Policy
        </h1>
        <p className="text-secondary text-sm font-medium tracking-wide uppercase">
          Last updated: February 19, 2026
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Intro */}
        <section className="p-8 rounded-2xl border border-surface bg-gradient-to-br from-primary/5 to-transparent">
          <p className="text-base text-secondary leading-relaxed">
            At Kreotype, your privacy matters to us. This Privacy Policy explains what information we collect, how we use it,
            and the choices you have. By using Kreotype, you agree to the practices described in this policy.
          </p>
        </section>

        {/* Section 1 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">1. Information We Collect</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-surface bg-surface/20">
              <h3 className="text-sm font-bold text-text mb-2">Information You Provide</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-secondary">
                <li>Name or username when creating an account</li>
                <li>Email address for authentication and notifications</li>
                <li>Password (stored as a cryptographic hash — never in plain text)</li>
                <li>Profile customizations such as bio or avatar</li>
                <li>Feedback or communications you send us directly</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-surface bg-surface/20">
              <h3 className="text-sm font-bold text-text mb-2">Information Collected Automatically</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-secondary">
                <li>Typing test results (WPM, accuracy, consistency, mode)</li>
                <li>Device type and browser information</li>
                <li>IP address and approximate geographic region</li>
                <li>Pages visited and features used within the platform</li>
                <li>Timestamps of activity and session duration</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">2. How We Use Your Information</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-secondary">
              <li>Provide, operate, and maintain the Kreotype service</li>
              <li>Authenticate your identity and secure your account</li>
              <li>Display your typing statistics, history, and achievements</li>
              <li>Populate and maintain leaderboards (if you have not opted out)</li>
              <li>Send transactional emails such as password resets and OTP codes</li>
              <li>Detect and prevent fraud, abuse, or violations of our Terms of Service</li>
              <li>Improve and develop new features based on usage patterns</li>
              <li>Respond to your support requests and inquiries</li>
            </ul>
            <p className="text-sm text-secondary leading-relaxed mt-3">
              We do not sell your personal information to third parties, ever.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">3. Cookies and Local Storage</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed mb-3">
              Kreotype uses cookies and browser local storage to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-secondary">
              <li>Maintain your authenticated session across page loads</li>
              <li>Remember your theme and configuration preferences</li>
              <li>Store typing test results locally before syncing to your account</li>
              <li>Analyze how the platform is used to improve performance</li>
            </ul>
            <p className="text-sm text-secondary leading-relaxed mt-3">
              Essential cookies are required for the service to function. You can disable non-essential cookies in your
              browser settings, but this may affect your experience on the platform.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">4. Data Sharing and Disclosure</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-surface bg-surface/20">
              <h3 className="text-sm font-bold text-text mb-2">When We May Share Data</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-secondary">
                <li>With service providers who help operate Kreotype (e.g., hosting, email delivery) under strict data processing agreements</li>
                <li>When required by law, court order, or legitimate government request</li>
                <li>To protect the safety or rights of Kreotype, our users, or the public</li>
                <li>In connection with a merger, acquisition, or sale of assets (users will be notified)</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-surface bg-surface/20">
              <h3 className="text-sm font-bold text-text mb-2">Public Information</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-secondary">
                <li>Your username and typing scores may appear on public leaderboards</li>
                <li>Your public profile information is visible to other users</li>
                <li>You can opt out of leaderboards at any time in your account settings</li>
                <li>Deleting your account removes your data from public-facing areas</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">5. Data Retention</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed mb-3">
              We retain your personal data for as long as your account is active or as necessary to provide you with the service.
              Specifically:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-secondary">
              <li>Account data is retained until you delete your account</li>
              <li>Typing test results and statistics are deleted when you delete your account or reset your data</li>
              <li>Audit logs may be retained for up to 90 days for security purposes</li>
              <li>Backups may retain data for up to 30 additional days after deletion</li>
            </ul>
          </div>
        </section>

        {/* Section 6 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">6. Your Rights and Choices</h2>
          </div>
          <div className="grid gap-3">
            <div className="p-4 rounded-xl border border-surface bg-surface/20">
              <h3 className="text-sm font-bold text-text mb-1">Access & Portability</h3>
              <p className="text-xs text-secondary leading-relaxed">
                You can export your typing test results at any time from the account settings page. This gives you
                a portable copy of your data in a machine-readable format.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-surface bg-surface/20">
              <h3 className="text-sm font-bold text-text mb-1">Correction</h3>
              <p className="text-xs text-secondary leading-relaxed">
                You can update your username, email, and other profile information directly from your account settings
                at any time.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-surface bg-surface/20">
              <h3 className="text-sm font-bold text-text mb-1">Deletion</h3>
              <p className="text-xs text-secondary leading-relaxed">
                You can permanently delete your account and all associated data from the account settings page. This
                action is irreversible. After deletion, your data will be removed from our active systems within 30 days.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-surface bg-surface/20">
              <h3 className="text-sm font-bold text-text mb-1">Leaderboard Opt-Out</h3>
              <p className="text-xs text-secondary leading-relaxed">
                You can opt your account out of all public leaderboards at any time via the account settings page.
                Your scores will no longer appear publicly, though they are still saved in your personal history.
              </p>
            </div>
          </div>
        </section>

        {/* Section 7 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">7. Data Security</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed mb-3">
              We take the security of your data seriously and implement industry-standard safeguards, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-secondary">
              <li>All data in transit is encrypted using TLS (HTTPS)</li>
              <li>Passwords are hashed using a strong, salted cryptographic algorithm — never stored in plain text</li>
              <li>Access to production systems is restricted to authorized personnel only</li>
              <li>Rate limiting is applied to authentication endpoints to prevent brute-force attacks</li>
              <li>Regular security reviews and dependency updates are performed</li>
            </ul>
            <p className="text-sm text-secondary leading-relaxed mt-3">
              No system is completely secure. If you believe your account has been compromised, please contact us
              immediately at{" "}
              <a href="mailto:kreotype@gmail.com" className="text-primary hover:underline">
                kreotype@gmail.com
              </a>
              .
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">8. Children&apos;s Privacy</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed">
              Kreotype is not directed at children under the age of 13. We do not knowingly collect personal information
              from children under 13. If you believe we have inadvertently collected such information, please contact us
              and we will take steps to delete it promptly.
            </p>
          </div>
        </section>

        {/* Section 9 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">9. Third-Party Services</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed">
              Kreotype may use third-party services for infrastructure and operations (such as cloud hosting and email
              delivery). These providers are contractually obligated to handle your data securely and only for the
              purpose of providing services to us. We do not use third-party advertising networks or sell your data to
              data brokers.
            </p>
          </div>
        </section>

        {/* Section 10 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">10. Changes to This Policy</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons.
              When we make material changes, we will notify you via email or through a notice on the platform. The date at
              the top of this page always reflects the most recent revision. Continued use of Kreotype after changes are
              posted constitutes acceptance of the updated policy.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="p-6 rounded-2xl border border-surface bg-surface/20">
          <h2 className="text-base font-bold text-text mb-2">Contact Us</h2>
          <p className="text-sm text-secondary leading-relaxed">
            If you have questions, concerns, or requests regarding your privacy or this policy, please reach out at{" "}
            <a href="mailto:kreotype@gmail.com" className="text-primary hover:underline">
              kreotype@gmail.com
            </a>
            . We aim to respond within 5 business days.
          </p>
        </section>
      </div>
    </div>
  );
}
