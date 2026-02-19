"use client";

import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-surface pb-8">
        <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-3">
          <FileText className="text-primary" size={32} strokeWidth={2.5} />
          Terms of Service
        </h1>
        <p className="text-secondary text-sm font-medium tracking-wide uppercase">
          Last updated: February 19, 2026
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Intro */}
        <section className="p-8 rounded-2xl border border-surface bg-gradient-to-br from-primary/5 to-transparent">
          <p className="text-base text-secondary leading-relaxed">
            Welcome to Kreotype. By accessing or using our platform, you agree to be bound by these Terms of Service.
            Please read them carefully before using the service. If you do not agree to these terms, you may not use Kreotype.
          </p>
        </section>

        {/* Section 1 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">1. Acceptance of Terms</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed">
              By creating an account or using Kreotype in any capacity, you confirm that you are at least 13 years of age
              and have the legal capacity to enter into a binding agreement. If you are under 18, you represent that a parent
              or legal guardian has reviewed and consented to these terms on your behalf.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">2. Description of Service</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed mb-3">
              Kreotype is a web-based typing test and practice platform. The service allows users to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-secondary">
              <li>Take typing speed and accuracy tests</li>
              <li>Create accounts and save test results</li>
              <li>View personal statistics and historical performance</li>
              <li>Compete on global and friend leaderboards</li>
              <li>Customize themes, settings, and typing test configurations</li>
              <li>Earn badges and track achievements</li>
            </ul>
            <p className="text-sm text-secondary leading-relaxed mt-3">
              We reserve the right to modify, suspend, or discontinue any part of the service at any time without prior notice.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">3. User Accounts</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-surface bg-surface/20">
              <h3 className="text-sm font-bold text-text mb-2">Account Responsibility</h3>
              <p className="text-xs text-secondary leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us
                immediately of any unauthorized use of your account. We are not liable for any loss resulting from
                unauthorized access due to your failure to safeguard your credentials.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-surface bg-surface/20">
              <h3 className="text-sm font-bold text-text mb-2">Account Information</h3>
              <p className="text-xs text-secondary leading-relaxed">
                You agree to provide accurate and complete information when creating your account. You must keep your
                account information up to date. We may use your email address to send service-related communications,
                which you cannot opt out of while maintaining an active account.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">4. Acceptable Use</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed mb-3">
              You agree not to use Kreotype in any way that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-secondary">
              <li>Violates any applicable law or regulation</li>
              <li>Infringes on the intellectual property rights of others</li>
              <li>Transmits harmful, offensive, or disruptive content</li>
              <li>Attempts to gain unauthorized access to our systems or other users&apos; accounts</li>
              <li>Uses automated tools, bots, or scripts to manipulate leaderboards or test results</li>
              <li>Interferes with or disrupts the integrity or performance of the service</li>
              <li>Engages in any form of data scraping or harvesting without express written consent</li>
              <li>Impersonates another person or misrepresents your affiliation with any entity</li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">5. Leaderboards and Fair Play</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed mb-3">
              Kreotype maintains public leaderboards to foster community competition. To protect the integrity of these rankings:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-secondary">
              <li>You may only submit results generated through legitimate use of the typing interface</li>
              <li>Using external tools, macros, or automation to inflate scores is strictly prohibited</li>
              <li>We reserve the right to remove results or ban accounts found to be cheating</li>
              <li>You may opt out of leaderboards at any time through your account settings</li>
            </ul>
          </div>
        </section>

        {/* Section 6 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">6. Intellectual Property</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed mb-3">
              All content, features, and functionality of Kreotype — including but not limited to the design, code, logos,
              text, graphics, themes, and word lists — are owned by Kreotype and are protected by applicable intellectual
              property laws.
            </p>
            <p className="text-sm text-secondary leading-relaxed">
              You are granted a limited, non-exclusive, non-transferable license to access and use the service for personal,
              non-commercial purposes. You may not reproduce, distribute, modify, or create derivative works of any portion
              of the service without express written permission.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">7. Termination</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed mb-3">
              We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct
              that we believe violates these Terms of Service or is harmful to other users, us, third parties, or the integrity
              of the service.
            </p>
            <p className="text-sm text-secondary leading-relaxed">
              You may delete your account at any time through the account settings page. Upon deletion, your personal data
              will be removed in accordance with our Privacy Policy. Termination does not relieve you of any obligations
              incurred prior to the termination date.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">8. Disclaimer of Warranties</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed">
              Kreotype is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either express or
              implied. We do not warrant that the service will be uninterrupted, error-free, or free of viruses or other
              harmful components. We disclaim all warranties of merchantability, fitness for a particular purpose, and
              non-infringement to the fullest extent permitted by law.
            </p>
          </div>
        </section>

        {/* Section 9 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">9. Limitation of Liability</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed">
              To the maximum extent permitted by applicable law, Kreotype and its operators shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use
              the service. Our total liability for any claim related to the service shall not exceed the amount you paid us
              in the twelve months preceding the claim, or $10 USD if no payment was made.
            </p>
          </div>
        </section>

        {/* Section 10 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">10. Changes to These Terms</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed">
              We may update these Terms of Service from time to time. When we make material changes, we will notify you
              via email or a prominent notice on the platform. Continued use of the service after changes are posted
              constitutes your acceptance of the revised terms. We encourage you to review these terms periodically.
            </p>
          </div>
        </section>

        {/* Section 11 */}
        <section className="flex flex-col gap-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-text mb-1">11. Governing Law</h2>
          </div>
          <div className="p-5 rounded-xl border border-surface bg-surface/20">
            <p className="text-sm text-secondary leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with applicable laws. Any disputes
              arising from these terms or your use of the service shall be resolved through good-faith negotiation first.
              If a resolution cannot be reached, disputes shall be subject to binding arbitration or the jurisdiction of
              competent courts.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="p-6 rounded-2xl border border-surface bg-surface/20">
          <h2 className="text-base font-bold text-text mb-2">Contact Us</h2>
          <p className="text-sm text-secondary leading-relaxed">
            If you have any questions about these Terms of Service, please contact us at{" "}
            <a href="mailto:kreotype@gmail.com" className="text-primary hover:underline">
              kreotype@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
