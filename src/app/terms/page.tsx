"use client";

import { FileText, UserCheck, AlertTriangle, Scale, Ban, Globe } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="w-full max-w-[1200px] mx-auto px-8 py-10 flex flex-col gap-8">
            {/* Header Section */}
            <div className="border-b border-surface pb-8">
                <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-3">
                    <FileText className="text-primary" size={32} strokeWidth={2.5} />
                    Terms of Service
                </h1>
                <p className="text-secondary text-sm font-medium tracking-wide uppercase">
                    Rules and guidelines for using Kreotype
                </p>
                <p className="text-secondary/60 text-xs mt-2">
                    Last updated: February 7, 2026
                </p>
            </div>

            <div className="flex flex-col gap-8">
                {/* Introduction */}
                <section className="p-6 rounded-2xl border border-surface bg-surface/30">
                    <p className="text-sm text-text leading-relaxed">
                        Welcome to Kreotype! These Terms of Service ("Terms") govern your access to and use of the
                        Kreotype website and services. By accessing or using Kreotype, you agree to be bound by these
                        Terms. If you do not agree to these Terms, please do not use our services.
                    </p>
                </section>

                {/* Acceptance of Terms */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <UserCheck className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">Acceptance of Terms</h2>
                            <p className="text-xs text-secondary">Agreement to use our service</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-surface bg-surface/20">
                        <p className="text-sm text-secondary leading-relaxed mb-3">
                            By creating an account or using Kreotype, you confirm that:
                        </p>
                        <ul className="space-y-2 text-sm text-secondary">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>You are at least 13 years of age or have parental/guardian consent.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>You have the legal capacity to enter into these Terms.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>You will comply with all applicable laws and regulations.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>All information you provide is accurate and up-to-date.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Description of Service */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <FileText className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">Description of Service</h2>
                            <p className="text-xs text-secondary">What Kreotype provides</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-surface bg-surface/20">
                        <p className="text-sm text-secondary leading-relaxed mb-3">
                            Kreotype is a web-based typing test platform that allows users to:
                        </p>
                        <ul className="space-y-2 text-sm text-secondary">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Take typing tests in various modes (time-based, word-based, zen mode).</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Track typing speed (WPM), accuracy, and consistency over time.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Customize themes, test settings, and user preferences.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>View leaderboards and compare performance with other users.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Save test results and view historical performance data.</span>
                            </li>
                        </ul>
                        <p className="text-sm text-secondary leading-relaxed mt-3">
                            We reserve the right to modify, suspend, or discontinue any part of the service at any time
                            without prior notice.
                        </p>
                    </div>
                </section>

                {/* User Accounts */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <UserCheck className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">User Accounts and Responsibilities</h2>
                            <p className="text-xs text-secondary">Your obligations as a user</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="p-5 rounded-xl border border-surface bg-surface/20">
                            <h3 className="text-sm font-bold text-text mb-2">Account Security</h3>
                            <p className="text-sm text-secondary leading-relaxed">
                                You are responsible for maintaining the confidentiality of your account credentials and for
                                all activities that occur under your account. You must immediately notify us of any
                                unauthorized use of your account or any other security breach.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl border border-surface bg-surface/20">
                            <h3 className="text-sm font-bold text-text mb-2">Account Accuracy</h3>
                            <p className="text-sm text-secondary leading-relaxed">
                                You agree to provide accurate, current, and complete information during registration and to
                                update such information to keep it accurate, current, and complete. Providing false or
                                misleading information may result in account termination.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl border border-surface bg-surface/20">
                            <h3 className="text-sm font-bold text-text mb-2">One Account Per Person</h3>
                            <p className="text-sm text-secondary leading-relaxed">
                                Each user may maintain only one account. Creating multiple accounts to manipulate
                                leaderboards or abuse the service is strictly prohibited and will result in permanent ban.
                            </p>
                        </div>
                    </div>
                </section>

                {/* User Conduct */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Ban className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">Prohibited Conduct</h2>
                            <p className="text-xs text-secondary">Activities that are not allowed</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-surface bg-surface/20">
                        <p className="text-sm text-secondary leading-relaxed mb-3">
                            You agree not to:
                        </p>
                        <ul className="space-y-2 text-sm text-secondary">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Use automated scripts, bots, or tools to take typing tests or manipulate results.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Attempt to gain unauthorized access to our systems or other users' accounts.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Upload or transmit viruses, malware, or any harmful code.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Harass, abuse, or harm other users through our platform.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Use the service for any illegal or unauthorized purpose.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Reverse engineer, decompile, or disassemble any part of the service.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Scrape, crawl, or collect data from the service without permission.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Intellectual Property */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Scale className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">Intellectual Property</h2>
                            <p className="text-xs text-secondary">Ownership and rights</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-surface bg-surface/20">
                        <p className="text-sm text-secondary leading-relaxed mb-3">
                            All content, features, and functionality of Kreotype, including but not limited to text,
                            graphics, logos, icons, images, audio clips, digital downloads, and software, are the
                            exclusive property of Kreotype and are protected by international copyright, trademark,
                            and other intellectual property laws.
                        </p>
                        <p className="text-sm text-secondary leading-relaxed">
                            You retain ownership of your typing test data and results. By using our service, you grant
                            Kreotype a non-exclusive, worldwide license to use, store, and display your data for the
                            purpose of providing and improving our services.
                        </p>
                    </div>
                </section>

                {/* Disclaimer of Warranties */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <AlertTriangle className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">Disclaimer of Warranties</h2>
                            <p className="text-xs text-secondary">Service provided "as is"</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-surface bg-surface/20">
                        <p className="text-sm text-secondary leading-relaxed mb-3">
                            Kreotype is provided on an "as is" and "as available" basis without warranties of any kind,
                            either express or implied, including but not limited to:
                        </p>
                        <ul className="space-y-2 text-sm text-secondary">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Warranties of merchantability or fitness for a particular purpose.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Warranties that the service will be uninterrupted, error-free, or secure.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Warranties regarding the accuracy or reliability of any content or data.</span>
                            </li>
                        </ul>
                        <p className="text-sm text-secondary leading-relaxed mt-3">
                            We do not guarantee that the service will meet your requirements or that defects will be
                            corrected. Your use of the service is at your own risk.
                        </p>
                    </div>
                </section>

                {/* Limitation of Liability */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Scale className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">Limitation of Liability</h2>
                            <p className="text-xs text-secondary">Limits on our responsibility</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-surface bg-surface/20">
                        <p className="text-sm text-secondary leading-relaxed">
                            To the maximum extent permitted by law, Kreotype and its affiliates, officers, employees,
                            agents, and licensors shall not be liable for any indirect, incidental, special, consequential,
                            or punitive damages, including but not limited to loss of profits, data, use, or goodwill,
                            arising out of or related to your use of or inability to use the service, even if we have been
                            advised of the possibility of such damages.
                        </p>
                    </div>
                </section>

                {/* Termination */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Ban className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">Termination</h2>
                            <p className="text-xs text-secondary">Account suspension and deletion</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-surface bg-surface/20">
                        <p className="text-sm text-secondary leading-relaxed mb-3">
                            We reserve the right to suspend or terminate your account and access to the service at our
                            sole discretion, without notice, for conduct that we believe:
                        </p>
                        <ul className="space-y-2 text-sm text-secondary">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Violates these Terms of Service.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Is harmful to other users, us, or third parties.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>Violates applicable laws or regulations.</span>
                            </li>
                        </ul>
                        <p className="text-sm text-secondary leading-relaxed mt-3">
                            You may also delete your account at any time through your account settings. Upon termination,
                            your right to use the service will immediately cease.
                        </p>
                    </div>
                </section>

                {/* Governing Law */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Globe className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">Governing Law</h2>
                            <p className="text-xs text-secondary">Legal jurisdiction</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-surface bg-surface/20">
                        <p className="text-sm text-secondary leading-relaxed">
                            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
                            in which Kreotype operates, without regard to its conflict of law provisions. Any disputes
                            arising from these Terms or your use of the service shall be resolved in the courts of that
                            jurisdiction.
                        </p>
                    </div>
                </section>

                {/* Changes to Terms */}
                <section className="p-5 rounded-xl border border-surface bg-primary/5 border-primary/20">
                    <h3 className="text-sm font-bold text-text mb-2">Changes to These Terms</h3>
                    <p className="text-sm text-secondary leading-relaxed">
                        We reserve the right to modify these Terms at any time. We will notify users of any material
                        changes by posting the new Terms on this page and updating the "Last updated" date. Your
                        continued use of the service after such changes constitutes your acceptance of the new Terms.
                    </p>
                </section>

                {/* Contact */}
                <section className="p-5 rounded-xl border border-surface bg-surface/20">
                    <h3 className="text-sm font-bold text-text mb-2">Contact Information</h3>
                    <p className="text-sm text-secondary leading-relaxed mb-3">
                        If you have questions about these Terms, please contact us:
                    </p>
                    <div className="space-y-2 text-sm">
                        <p className="text-text">
                            <strong>Email:</strong>{" "}
                            <a href="mailto:legal@kreotype.com" className="text-primary hover:underline">
                                legal@kreotype.com
                            </a>
                        </p>
                        <p className="text-text">
                            <strong>Website:</strong>{" "}
                            <a href="https://kreotype.com" className="text-primary hover:underline">
                                kreotype.com
                            </a>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
