"use client";
import React from "react";
import { Card } from "primereact/card";
import { useTheme } from "@/src/components/ThemeProvider";
import { Footer } from "@/src/components/Footer";

export default function TermsOfServicePage() {
  const { theme } = useTheme();

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700 text-gray-100"
      : "bg-white border-gray-200 text-gray-900";

  return (
    <>
      <div className="min-h-screen p-4 md:p-8">
        <Card className={`max-w-4xl mx-auto ${cardBg}`}>
          <div className="prose dark:prose-invert max-w-none">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Last Updated: January 17, 2026
            </p>

            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="mb-4">
                By accessing or using CORSA ("the Service"), you agree to be bound by these Terms of Service
                ("Terms").
              </p>
              <p className="mb-4">
                CORSA is a Community Application that integrates with third-party services including Strava.
                Your use of these integrations is subject to additional terms from those providers.
              </p>
            </section>

            {/* Strava Integration */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Strava Integration</h2>
              
              <h3 className="text-xl font-semibold mb-3">2.1 Community Application Status</h3>
              <p className="mb-4">
                CORSA operates as a "Community Application" under Strava's API Agreement. This means:
              </p>

              <h3 className="text-xl font-semibold mb-3">2.2 Data Usage</h3>
              <p className="mb-4">
                When you connect your Strava account to CORSA: 
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Your Data Only:</strong> We display only YOUR Strava data to you, unless you're participating in a Community Application feature</li>
                <li><strong>Community Features:</strong> In community leaderboards and group activities, your data may be visible to other community members</li>
                <li><strong>No Third-Party Sharing:</strong> We will never sell, rent, or share your Strava data with third parties</li>
                <li><strong>No AI Training:</strong> Your data will never be used to train artificial intelligence or machine learning models</li>
                <li><strong>No Advertising:</strong> We do not use your Strava data for targeted advertising</li>
                <li><strong>No Analytics Products:</strong> We do not aggregate or analyze your data for commercial analytics products</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.3 Strava Terms</h3>
              <p className="mb-4">
                Your use of Strava data through CORSA is also governed by: 
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <a 
                    href="https://www.strava.com/legal/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Strava Terms of Service
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.strava.com/legal/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover: text-blue-600 dark: text-blue-400 dark: hover:text-blue-300"
                  >
                    Strava Privacy Policy
                  </a>
                </li>
                <li>
                  <a 
                    href="https://developers.strava.com/docs/getting-started/#agreement" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Strava API Agreement
                  </a>
                </li>
              </ul>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                In the event of any conflict between these Terms and Strava's terms, Strava's terms will control
                with respect to your Strava data.
              </p>
            </section>

            {/* User Responsibilities */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
              
              <h3 className="text-xl font-semibold mb-3">3.1 Account Security</h3>
              <p className="mb-4">You are responsible for: </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
              </ul>

            </section>

            {/* Data Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Your Data Rights</h2>
              
              <h3 className="text-xl font-semibold mb-3">4.1 Data Access</h3>
              <p className="mb-4">
                You have the right to access all data we have collected about you at any time through
                your account settings. 
              </p>

              <h3 className="text-xl font-semibold mb-3">4.2 Data Deletion</h3>
              <p className="mb-4">
                You may request deletion of your data at any time. We will:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Delete all your personal data within 48 hours of your request</li>
                <li>Delete all Strava data within 48 hours of disconnecting your Strava account</li>
                <li>Remove you from all leaderboards and community features</li>
                <li>Provide confirmation of deletion upon request</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.3 Data Portability</h3>
              <p className="mb-4">
                You can download a copy of your data at any time through the Privacy & Data settings page.
              </p>
            </section>

            {/* Service Limitations */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Service Limitations</h2>
              
              <h3 className="text-xl font-semibold mb-3">5.1 Community Size Limit</h3>
              <p className="mb-4">
                As a Community Application, CORSA is limited to 9,999 registered users. If this limit is
                reached, we may need to restrict new registrations or transition to a different service model.
              </p>

              <h3 className="text-xl font-semibold mb-3">5.2 API Rate Limits</h3>
              <p className="mb-4">
                Your use of Strava features through CORSA is subject to rate limits imposed by Strava.
                We may need to restrict your usage if you exceed these limits.
              </p>

              <h3 className="text-xl font-semibold mb-3">5.3 Service Availability</h3>
              <p className="mb-4">
                We strive for high availability but do not guarantee uninterrupted access. The Service is
                provided "as is" and "as available."
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold mb-3">6.1 Your Content</h3>
              <p className="mb-4">
                You retain all rights to content you create or upload to CORSA.  By posting content, you grant
                us a license to display, store, and transmit that content as necessary to provide the Service.
              </p>

              <h3 className="text-xl font-semibold mb-3">6.2 CORSA Property</h3>
              <p className="mb-4">
                All CORSA branding, design, code, and features are the property of CORSA and protected by
                copyright and trademark laws.
              </p>

              <h3 className="text-xl font-semibold mb-3">6.3 Third-Party Marks</h3>
              <p className="mb-4">
                Strava and the Strava logo are trademarks of Strava, Inc. Other third-party trademarks
                mentioned are the property of their respective owners. 
              </p>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Disclaimers and Limitations</h2>
              
              <h3 className="text-xl font-semibold mb-3">7.1 No Warranties</h3>
              <p className="mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. 
              </p>

              <h3 className="text-xl font-semibold mb-3">7.2 Limitation of Liability</h3>
              <p className="mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CORSA SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
                REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL,
                OR OTHER INTANGIBLE LOSSES. 
              </p>

              <h3 className="text-xl font-semibold mb-3">7.3 Third-Party Services</h3>
              <p className="mb-4">
                We disclaim all warranties on behalf of third-party service providers (including Strava)
                and exclude them from all liability for consequential, special, punitive, or indirect damages.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
              
              <h3 className="text-xl font-semibold mb-3">8.1 By You</h3>
              <p className="mb-4">
                You may terminate your account at any time by requesting it from our support email. Upon termination,
                we will delete your data in accordance with our data deletion policies.
              </p>

              <h3 className="text-xl font-semibold mb-3">8.2 By Us</h3>
              <p className="mb-4">
                We may suspend or terminate your account if you: 
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent or illegal activity</li>
                <li>Pose a security or legal risk</li>
                <li>Abuse the Service or other users</li>
              </ul>
              <p className="mb-4">
                We will provide notice when reasonably possible, but we may terminate immediately in cases
                of severe violations.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
              <p className="mb-4">
                We may update these Terms from time to time. We will notify you of material changes by: 
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Posting the updated Terms on this page</li>
                <li>Updating the "Last Updated" date</li>
                <li>Sending you an email notification (for significant changes)</li>
              </ul>
              <p className="mb-4">
                Your continued use of the Service after changes constitutes acceptance of the updated Terms. 
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Governing Law and Disputes</h2>
              
              <h3 className="text-xl font-semibold mb-3">10.1 Governing Law</h3>
              <p className="mb-4">
                These Terms are governed by the laws of the State of California, United States, without
                regard to conflict of law provisions.
              </p>

              <h3 className="text-xl font-semibold mb-3">10.2 Dispute Resolution</h3>
              <p className="mb-4">
                Any disputes arising from these Terms or your use of the Service shall be resolved in the
                state or federal courts of San Francisco County, California. 
              </p>

              <h3 className="text-xl font-semibold mb-3">10.3 Time Limit</h3>
              <p className="mb-4">
                Any claim or cause of action must be filed within one year after such claim or cause of
                action arose or be forever barred.
              </p>
            </section>

            {/* Miscellaneous */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Miscellaneous</h2>
              
              <h3 className="text-xl font-semibold mb-3">11.1 Entire Agreement</h3>
              <p className="mb-4">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you
                and CORSA regarding the Service.
              </p>

              <h3 className="text-xl font-semibold mb-3">11.2 Severability</h3>
              <p className="mb-4">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will
                remain in full force and effect.
              </p>

              <h3 className="text-xl font-semibold mb-3">11.3 No Waiver</h3>
              <p className="mb-4">
                Our failure to enforce any right or provision of these Terms will not be considered a waiver
                of those rights.
              </p>

              <h3 className="text-xl font-semibold mb-3">11.4 Assignment</h3>
              <p className="mb-4">
                You may not assign or transfer these Terms without our prior written consent.  We may assign
                our rights and obligations under these Terms without restriction.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p className="mb-4">
                If you have questions about these Terms, please contact us at:
              </p>
              <p className="mb-2">
                <strong>Email:</strong>{" "}
                <a 
                  href="mailto:lukemccrae@corsa.run" 
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  lukemccrae@corsa.run
                </a>
              </p>
            </section>

            {/* Acknowledgment */}
            <section className="mb-8 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Acknowledgment of Strava Integration</h3>
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src="/api_logo_pwrdBy_strava_horiz_white.svg" 
                  alt="Powered by Strava"
                  className="h-8"
                />
              </div>
              <p className="text-sm">
                CORSA uses the Strava API to provide enhanced features.  By using CORSA's Strava integration,
                you acknowledge that you have read and agree to Strava's{" "}
                <a 
                  href="https://www.strava.com/legal/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a 
                  href="https://www.strava.com/legal/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Privacy Policy
                </a>. 
              </p>
            </section>
          </div>
        </Card>
      </div>
    </>
  );
}