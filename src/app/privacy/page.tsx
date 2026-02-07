"use client";

import { Shield, Lock, Eye, Database, Cookie, Mail } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="w-full max-w-[1200px] mx-auto px-8 py-10 flex flex-col gap-8">
            {/* Header Section */}
            <div className="border-b border-surface pb-8">
                <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-3">
                    <Shield className="text-primary" size={32} strokeWidth={2.5} />
                    Privacy Policy
                </h1>
                <p className="text-secondary text-sm font-medium tracking-wide uppercase">
                    How we protect and handle your data
                </p>
                <p className="text-secondary/60 text-xs mt-2">
                    Last updated: February 7, 2026
                </p>
            </div>

            <div className="flex flex-col gap-8">
                {/* Introduction */}
                <section className="p-6 rounded-2xl border border-surface bg-surface/30">
                    <p className="text-sm text-text leading-relaxed">
                        At Kreotype, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                        and protect your personal information when you use our typing test platform. By using Kreotype,
                        you agree to the collection and use of information in accordance with this policy.
                    </p>
                </section>

                {/* Information We Collect */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Database className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">Information We Collect</h2>
                            <p className="text-xs text-secondary">Data we gather to provide our services</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="p-5 rounded-xl border border-surface bg-surface/20">
                            <h3 className="text-sm font-bold text-text mb-2">Account Information</h3>
                            <p className="text-sm text-secondary leading-relaxed">
                                When you create an account, we collect your email address, username, and authentication
                                credentials. This information is necessary to provide you with personalized features like
                                saving your typing test results and tracking your progress over time.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl border border-surface bg-surface/20">
                            <h3 className="text-sm font-bold text-text mb-2">Typing Test Data</h3>
                            <p className="text-sm text-secondary leading-relaxed">
                                We collect and store your typing test results, including words per minute (WPM), accuracy,
                                test duration, and performance metrics. This data helps you track your improvement and
                                compare your performance on leaderboards.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl border border-surface bg-surface/20">
                            <h3 className="text-sm font-bold text-text mb-2">Usage Information</h3>
                            <p className="text-sm text-secondary leading-relaxed">
                                We automatically collect certain information about your device and how you interact with
                                Kreotype, including your IP address, browser type, operating system, and pages visited.
                                This helps us improve our service and troubleshoot issues.
                            </p>
                        </div>
                    </div>
                </section>

                {/* How We Use Your Information */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Eye className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">How We Use Your Information</h2>
                            <p className="text-xs text-secondary">Ways we utilize collected data</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-surface bg-surface/20">
                        <ul className="space-y-3 text-sm text-secondary">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong className="text-text">Provide Services:</strong> To deliver typing tests, save your results, and display your progress and statistics.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong className="text-text">Personalization:</strong> To customize your experience with themes, preferences, and personalized recommendations.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong className="text-text">Analytics:</strong> To understand how users interact with Kreotype and improve our platform's performance and features.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong className="text-text">Communication:</strong> To send you important updates, security alerts, and respond to your inquiries.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong className="text-text">Security:</strong> To protect against fraud, abuse, and unauthorized access to our services.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Data Storage and Security */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Lock className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">Data Storage and Security</h2>
                            <p className="text-xs text-secondary">How we protect your information</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-surface bg-surface/20">
                        <p className="text-sm text-secondary leading-relaxed mb-3">
                            We implement industry-standard security measures to protect your personal information from
                            unauthorized access, disclosure, alteration, or destruction. Your data is stored on secure
                            servers with encryption both in transit and at rest.
                        </p>
                        <p className="text-sm text-secondary leading-relaxed">
                            However, no method of transmission over the internet or electronic storage is 100% secure.
                            While we strive to use commercially acceptable means to protect your data, we cannot guarantee
                            its absolute security.
                        </p>
                    </div>
                </section>

                {/* Cookies and Tracking */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Cookie className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">Cookies and Tracking</h2>
                            <p className="text-xs text-secondary">Technologies we use</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-surface bg-surface/20">
                        <p className="text-sm text-secondary leading-relaxed mb-3">
                            Kreotype uses cookies and similar tracking technologies to enhance your experience. Cookies
                            are small data files stored on your device that help us remember your preferences, keep you
                            logged in, and analyze site traffic.
                        </p>
                        <div className="space-y-2 text-sm text-secondary">
                            <p><strong className="text-text">Essential Cookies:</strong> Required for the website to function properly (authentication, security).</p>
                            <p><strong className="text-text">Preference Cookies:</strong> Remember your settings like theme and test configurations.</p>
                            <p><strong className="text-text">Analytics Cookies:</strong> Help us understand how visitors use our site to improve performance.</p>
                        </div>
                    </div>
                </section>

                {/* Third-Party Services */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Database className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">Third-Party Services</h2>
                            <p className="text-xs text-secondary">External services we use</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-surface bg-surface/20">
                        <p className="text-sm text-secondary leading-relaxed mb-3">
                            We may use third-party services to help us operate Kreotype and provide better services to you.
                            These services have access to your personal information only to perform specific tasks on our
                            behalf and are obligated not to disclose or use it for any other purpose.
                        </p>
                        <p className="text-sm text-secondary leading-relaxed">
                            Third-party services we use may include authentication providers (Google, GitHub), analytics
                            platforms, and hosting services. Each of these services has their own privacy policies governing
                            the use of your information.
                        </p>
                    </div>
                </section>

                {/* Your Rights */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Shield className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">Your Rights</h2>
                            <p className="text-xs text-secondary">Control over your data</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-surface bg-surface/20">
                        <p className="text-sm text-secondary leading-relaxed mb-3">
                            You have the right to:
                        </p>
                        <ul className="space-y-2 text-sm text-secondary">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong className="text-text">Access:</strong> Request a copy of the personal data we hold about you.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong className="text-text">Correction:</strong> Request correction of inaccurate or incomplete data.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong className="text-text">Deletion:</strong> Request deletion of your account and associated data.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong className="text-text">Export:</strong> Download your typing test data in a portable format.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong className="text-text">Opt-out:</strong> Unsubscribe from marketing communications at any time.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Contact Us */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Mail className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text">Contact Us</h2>
                            <p className="text-xs text-secondary">Questions about privacy</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-surface bg-surface/20">
                        <p className="text-sm text-secondary leading-relaxed mb-3">
                            If you have any questions or concerns about this Privacy Policy or our data practices,
                            please contact us:
                        </p>
                        <div className="space-y-2 text-sm">
                            <p className="text-text">
                                <strong>Email:</strong>{" "}
                                <a href="mailto:privacy@kreotype.com" className="text-primary hover:underline">
                                    privacy@kreotype.com
                                </a>
                            </p>
                            <p className="text-text">
                                <strong>Website:</strong>{" "}
                                <a href="https://kreotype.com" className="text-primary hover:underline">
                                    kreotype.com
                                </a>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Changes to Policy */}
                <section className="p-5 rounded-xl border border-surface bg-primary/5 border-primary/20">
                    <h3 className="text-sm font-bold text-text mb-2">Changes to This Privacy Policy</h3>
                    <p className="text-sm text-secondary leading-relaxed">
                        We may update our Privacy Policy from time to time. We will notify you of any changes by
                        posting the new Privacy Policy on this page and updating the "Last updated" date. You are
                        advised to review this Privacy Policy periodically for any changes.
                    </p>
                </section>
            </div>
        </div>
    );
}
