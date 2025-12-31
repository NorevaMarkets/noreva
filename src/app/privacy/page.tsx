export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero.png')" }}
        />
        <div className="absolute inset-0 bg-[var(--background)]/70" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--background)] to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-[var(--foreground-muted)]">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert max-w-none">
          <div className="space-y-10 text-[var(--foreground-muted)]">
            
            {/* Introduction */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">1. Introduction</h2>
              <p className="leading-relaxed mb-4">
                Welcome to Noreva ("we," "our," or "us"). We are committed to protecting your privacy and 
                ensuring the security of your personal information. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our decentralized application (dApp) 
                and related services.
              </p>
              <p className="leading-relaxed">
                By accessing or using Noreva, you agree to the collection and use of information in accordance 
                with this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do 
                not access or use our services.
              </p>
            </div>

            {/* Information We Collect */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">2.1 Information You Provide</h3>
              <p className="leading-relaxed mb-4">
                When you connect your wallet to Noreva, we collect:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Your public wallet address (Solana public key)</li>
                <li>Transaction signatures you authorize through our platform</li>
                <li>Any preferences or settings you configure within our application</li>
              </ul>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">2.2 Automatically Collected Information</h3>
              <p className="leading-relaxed mb-4">
                When you access our platform, we may automatically collect certain information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Device information (browser type, operating system, device type)</li>
                <li>IP address and approximate geographic location</li>
                <li>Pages visited and features used within the application</li>
                <li>Time and date of access</li>
                <li>Referring website or application</li>
                <li>Click patterns and navigation behavior</li>
              </ul>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">2.3 Blockchain Data</h3>
              <p className="leading-relaxed">
                Please note that blockchain transactions are inherently public. Any transactions you conduct 
                through our platform will be recorded on the Solana blockchain and are publicly visible. This 
                includes your wallet address, transaction amounts, timestamps, and token transfers. We do not 
                have control over this public blockchain data.
              </p>
            </div>

            {/* How We Use Your Information */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">3. How We Use Your Information</h2>
              <p className="leading-relaxed mb-4">
                We use the collected information for various purposes, including:
              </p>
              
              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">3.1 Service Provision</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>To provide, operate, and maintain our platform</li>
                <li>To display your portfolio holdings and transaction history</li>
                <li>To execute trades and swaps on your behalf (with your explicit authorization)</li>
                <li>To show real-time price data and market information</li>
              </ul>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">3.2 Platform Improvement</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>To understand how users interact with our platform</li>
                <li>To identify and fix bugs or technical issues</li>
                <li>To develop new features and improve existing functionality</li>
                <li>To optimize user experience and interface design</li>
              </ul>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">3.3 Security and Compliance</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To detect and prevent fraudulent or unauthorized activity</li>
                <li>To protect the security and integrity of our platform</li>
                <li>To comply with legal obligations and regulatory requirements</li>
                <li>To enforce our Terms of Service</li>
              </ul>
            </div>

            {/* Data Sharing */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">4. Data Sharing and Disclosure</h2>
              <p className="leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">4.1 Third-Party Service Providers</h3>
              <p className="leading-relaxed mb-4">
                We integrate with various third-party services to provide our functionality:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li><strong>Jupiter Aggregator:</strong> For executing token swaps and obtaining quotes</li>
                <li><strong>Backed Finance (xStocks):</strong> For tokenized stock price data and information</li>
                <li><strong>Finnhub:</strong> For traditional stock market data</li>
                <li><strong>Helius:</strong> For Solana RPC services and blockchain data</li>
                <li><strong>TradingView:</strong> For chart visualization</li>
              </ul>
              <p className="leading-relaxed">
                Each of these services has their own privacy policies governing the use of your data.
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">4.2 Legal Requirements</h3>
              <p className="leading-relaxed">
                We may disclose your information if required by law, regulation, legal process, or governmental 
                request, or when we believe disclosure is necessary to protect our rights, protect your safety 
                or the safety of others, investigate fraud, or respond to a government request.
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">4.3 Business Transfers</h3>
              <p className="leading-relaxed">
                In the event of a merger, acquisition, reorganization, or sale of assets, your information may 
                be transferred as part of that transaction. We will notify you via prominent notice on our 
                platform of any change in ownership or use of your personal information.
              </p>
            </div>

            {/* Data Security */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">5. Data Security</h2>
              <p className="leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your 
                information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Encryption of data in transit using TLS/SSL</li>
                <li>Regular security assessments and audits</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Monitoring for suspicious activity</li>
              </ul>
              <p className="leading-relaxed">
                However, no method of transmission over the Internet or electronic storage is 100% secure. 
                While we strive to use commercially acceptable means to protect your information, we cannot 
                guarantee absolute security. You are responsible for maintaining the security of your wallet 
                and private keys.
              </p>
            </div>

            {/* Data Retention */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">6. Data Retention</h2>
              <p className="leading-relaxed mb-4">
                We retain your information only for as long as necessary to fulfill the purposes outlined in 
                this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Usage analytics data: Up to 24 months</li>
                <li>Server logs: Up to 90 days</li>
                <li>Wallet connection history: Until you disconnect your wallet</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Note that blockchain data is permanent and cannot be deleted by us or anyone else.
              </p>
            </div>

            {/* Your Rights */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">7. Your Rights and Choices</h2>
              <p className="leading-relaxed mb-4">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">7.1 Access and Portability</h3>
              <p className="leading-relaxed mb-4">
                You have the right to request access to the personal information we hold about you and to 
                receive a copy of that information in a portable format.
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">7.2 Correction</h3>
              <p className="leading-relaxed mb-4">
                You have the right to request correction of any inaccurate personal information we hold about you.
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">7.3 Deletion</h3>
              <p className="leading-relaxed mb-4">
                You have the right to request deletion of your personal information, subject to certain exceptions 
                required by law or for legitimate business purposes.
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">7.4 Opt-Out</h3>
              <p className="leading-relaxed mb-4">
                You can disconnect your wallet at any time to stop sharing your wallet address with our platform. 
                You may also opt out of analytics by using browser privacy features or extensions.
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">7.5 Do Not Track</h3>
              <p className="leading-relaxed">
                We do not currently respond to "Do Not Track" signals from web browsers.
              </p>
            </div>

            {/* Cookies */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">8. Cookies and Similar Technologies</h2>
              <p className="leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our platform:
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">8.1 Essential Cookies</h3>
              <p className="leading-relaxed mb-4">
                These cookies are necessary for the platform to function properly. They enable basic functions 
                like wallet connection state and user preferences.
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">8.2 Analytics Cookies</h3>
              <p className="leading-relaxed mb-4">
                We may use analytics cookies to understand how users interact with our platform. This helps us 
                improve our services.
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">8.3 Managing Cookies</h3>
              <p className="leading-relaxed">
                Most web browsers allow you to control cookies through their settings. However, disabling certain 
                cookies may limit your ability to use some features of our platform.
              </p>
            </div>

            {/* International Transfers */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">9. International Data Transfers</h2>
              <p className="leading-relaxed">
                Our platform is accessible globally. If you access our services from outside the jurisdiction 
                where our servers are located, please be aware that your information may be transferred to, 
                stored, and processed in different countries. By using our services, you consent to the transfer 
                of your information to countries that may have different data protection laws than your country 
                of residence.
              </p>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">10. Children's Privacy</h2>
              <p className="leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children under 18. If you are a parent or guardian and believe your 
                child has provided us with personal information, please contact us, and we will take steps to 
                delete such information.
              </p>
            </div>

            {/* Changes */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">11. Changes to This Privacy Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for 
                other operational, legal, or regulatory reasons. We will notify you of any material changes by 
                posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage 
                you to review this Privacy Policy periodically for any changes. Your continued use of our 
                services after any modifications indicates your acceptance of the updated Privacy Policy.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">12. Contact Us</h2>
              <p className="leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data 
                practices, please contact us through:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Our official X (Twitter) account</li>
                <li>Our GitHub repository</li>
              </ul>
              <p className="leading-relaxed mt-4">
                We will respond to your inquiry within a reasonable timeframe.
              </p>
            </div>

            {/* Summary Box */}
            <div className="p-6 bg-[var(--background-card)] border border-[var(--border)] rounded-xl mt-8">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">Privacy Summary</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--positive)]">✓</span>
                  <span>We collect minimal data necessary to provide our services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--positive)]">✓</span>
                  <span>We never sell your personal information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--positive)]">✓</span>
                  <span>Blockchain transactions are public by nature</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--positive)]">✓</span>
                  <span>You can disconnect your wallet at any time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--positive)]">✓</span>
                  <span>We use industry-standard security measures</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
