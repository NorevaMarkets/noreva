export default function TermsPage() {
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
            Terms of Service
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

            {/* Important Notice */}
            <div className="p-6 bg-[var(--negative)]/10 border border-[var(--negative)]/30 rounded-xl">
              <h3 className="text-lg font-semibold text-[var(--negative)] mb-3">⚠️ Important Notice</h3>
              <p className="text-sm leading-relaxed">
                Trading tokenized stocks and cryptocurrencies involves substantial risk of loss. The value of 
                your investments can go down as well as up, and you may lose all of your invested capital. 
                Past performance is not indicative of future results. Please read these Terms of Service 
                carefully before using our platform.
              </p>
            </div>

            {/* Acceptance */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed mb-4">
                By accessing, browsing, or using the Noreva platform ("Platform," "Service," or "we/us/our"), 
                you ("User" or "you") acknowledge that you have read, understood, and agree to be bound by 
                these Terms of Service ("Terms"), along with our Privacy Policy.
              </p>
              <p className="leading-relaxed mb-4">
                If you do not agree to these Terms, you must not access or use our Platform. Your continued 
                use of the Platform following any modifications to these Terms constitutes acceptance of those 
                modifications.
              </p>
              <p className="leading-relaxed">
                These Terms constitute a legally binding agreement between you and Noreva. You represent and 
                warrant that you have the legal capacity to enter into this agreement.
              </p>
            </div>

            {/* Eligibility */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">2. Eligibility</h2>
              <p className="leading-relaxed mb-4">
                To use our Platform, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Not be a resident of a jurisdiction where access to or use of the Platform is prohibited</li>
                <li>Not be subject to economic sanctions or designated on any list of prohibited or restricted parties</li>
                <li>Have a compatible Solana wallet</li>
              </ul>
              <p className="leading-relaxed">
                By using the Platform, you represent and warrant that you meet all eligibility requirements. 
                We reserve the right to restrict access to users from certain jurisdictions at our sole discretion.
              </p>
            </div>

            {/* Description of Services */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">3. Description of Services</h2>
              
              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">3.1 Platform Overview</h3>
              <p className="leading-relaxed mb-4">
                Noreva is a decentralized application (dApp) that provides:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Real-time price tracking for tokenized stocks on the Solana blockchain</li>
                <li>Spread analysis between tokenized assets and their underlying traditional stocks</li>
                <li>Portfolio tracking and management</li>
                <li>Integration with decentralized exchanges for token swaps</li>
                <li>Market data visualization and charting tools</li>
              </ul>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">3.2 Third-Party Services</h3>
              <p className="leading-relaxed mb-4">
                Our Platform integrates with various third-party services including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li><strong>Jupiter Aggregator:</strong> For swap execution and route optimization</li>
                <li><strong>Backed Finance:</strong> For tokenized stock issuance and price data</li>
                <li><strong>Finnhub:</strong> For traditional market data</li>
                <li><strong>TradingView:</strong> For chart visualization</li>
                <li><strong>Solana Blockchain:</strong> For transaction processing</li>
              </ul>
              <p className="leading-relaxed">
                We are not responsible for the availability, accuracy, or functionality of these third-party 
                services. Your use of third-party services is subject to their respective terms and conditions.
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">3.3 Non-Custodial Nature</h3>
              <p className="leading-relaxed">
                Noreva is a non-custodial platform. We do not hold, control, or have access to your private 
                keys, tokens, or funds. All transactions are executed directly on the Solana blockchain through 
                your connected wallet. You maintain complete control and responsibility over your assets at all times.
              </p>
            </div>

            {/* Risk Disclosure */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">4. Risk Disclosure</h2>
              <p className="leading-relaxed mb-4">
                By using our Platform, you acknowledge and accept the following risks:
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">4.1 Market Risks</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Cryptocurrency and tokenized assets are highly volatile</li>
                <li>Prices can fluctuate significantly within short periods</li>
                <li>You may lose some or all of your investment</li>
                <li>Past performance does not guarantee future results</li>
                <li>Market conditions can change rapidly and without warning</li>
              </ul>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">4.2 Technical Risks</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Smart contract vulnerabilities or bugs</li>
                <li>Blockchain network congestion or downtime</li>
                <li>Wallet software vulnerabilities</li>
                <li>Failed or stuck transactions</li>
                <li>Oracle failures or data feed inaccuracies</li>
              </ul>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">4.3 Tokenized Stock Risks</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Tokenized stocks may not perfectly track their underlying assets</li>
                <li>Spreads between token and stock prices can be significant</li>
                <li>Liquidity may be limited for certain tokenized assets</li>
                <li>Regulatory changes may affect tokenized stock availability</li>
                <li>Issuer risk associated with the tokenization provider</li>
              </ul>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">4.4 Regulatory Risks</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Regulatory status of tokenized securities varies by jurisdiction</li>
                <li>Laws and regulations may change, potentially affecting your ability to trade</li>
                <li>You are responsible for understanding and complying with applicable laws</li>
                <li>Tax implications vary by jurisdiction and are your responsibility</li>
              </ul>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">4.5 Slippage and Price Impact</h3>
              <p className="leading-relaxed">
                When executing trades, you may experience slippage (the difference between expected and actual 
                execution price) and price impact (the effect of your trade on the market price). Large trades 
                in low-liquidity pools may result in significant price impact.
              </p>
            </div>

            {/* User Responsibilities */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">5. User Responsibilities</h2>
              <p className="leading-relaxed mb-4">
                As a user of our Platform, you agree to:
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">5.1 Security Obligations</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Maintain the security and confidentiality of your wallet private keys and seed phrases</li>
                <li>Use secure devices and networks when accessing the Platform</li>
                <li>Enable appropriate security measures on your wallet (hardware wallets recommended)</li>
                <li>Never share your private keys or seed phrases with anyone</li>
                <li>Be vigilant against phishing attempts and fraudulent websites</li>
              </ul>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">5.2 Trading Obligations</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Verify all transaction details before signing and submitting</li>
                <li>Understand the risks associated with each trade</li>
                <li>Only trade with funds you can afford to lose</li>
                <li>Conduct your own research before making investment decisions</li>
                <li>Review and understand slippage settings before executing trades</li>
              </ul>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">5.3 Legal Compliance</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Comply with all applicable laws and regulations in your jurisdiction</li>
                <li>Report and pay any applicable taxes on your trading activities</li>
                <li>Not use the Platform for money laundering or other illegal activities</li>
                <li>Not attempt to circumvent any geographic restrictions</li>
              </ul>

              <h3 className="text-lg font-medium text-[var(--foreground)] mt-6 mb-3">5.4 Prohibited Activities</h3>
              <p className="leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Manipulate markets or engage in wash trading</li>
                <li>Use bots or automated systems to disrupt the Platform</li>
                <li>Exploit bugs or vulnerabilities for personal gain</li>
                <li>Interfere with other users' access to the Platform</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Use the Platform to facilitate illegal activities</li>
              </ul>
            </div>

            {/* No Financial Advice */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">6. No Financial Advice</h2>
              <p className="leading-relaxed mb-4">
                <strong className="text-[var(--foreground)]">Nothing on this Platform constitutes financial, 
                investment, legal, tax, or any other form of professional advice.</strong>
              </p>
              <p className="leading-relaxed mb-4">
                All information provided on the Platform, including but not limited to prices, charts, market 
                data, spread analysis, and portfolio information, is for informational purposes only. This 
                information should not be construed as a recommendation to buy, sell, or hold any asset.
              </p>
              <p className="leading-relaxed mb-4">
                We strongly recommend that you:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Consult with qualified financial advisors before making investment decisions</li>
                <li>Conduct thorough independent research</li>
                <li>Consider your financial situation, investment objectives, and risk tolerance</li>
                <li>Seek professional tax advice regarding the tax implications of trading</li>
              </ul>
              <p className="leading-relaxed">
                Any decisions you make based on information obtained through our Platform are made at your 
                own risk and sole responsibility.
              </p>
            </div>

            {/* Intellectual Property */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">7. Intellectual Property</h2>
              <p className="leading-relaxed mb-4">
                All content, features, and functionality on the Platform, including but not limited to text, 
                graphics, logos, icons, images, audio clips, software, and code, are owned by Noreva or 
                its licensors and are protected by intellectual property laws.
              </p>
              <p className="leading-relaxed mb-4">
                You are granted a limited, non-exclusive, non-transferable license to access and use the 
                Platform for personal, non-commercial purposes. This license does not include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Any resale or commercial use of the Platform</li>
                <li>Collection or use of any product listings, descriptions, or prices</li>
                <li>Any derivative use of the Platform or its contents</li>
                <li>Downloading or copying account information for another party's benefit</li>
                <li>Any use of data mining, robots, or similar data gathering tools</li>
              </ul>
            </div>

            {/* Limitation of Liability */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">8. Limitation of Liability</h2>
              <p className="leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
              </p>
              <p className="leading-relaxed mb-4">
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER 
                EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO WARRANTIES OF 
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, ACCURACY, OR 
                NON-INFRINGEMENT.
              </p>
              <p className="leading-relaxed mb-4">
                WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, THAT 
                DEFECTS WILL BE CORRECTED, OR THAT THE PLATFORM OR SERVER THAT MAKES IT AVAILABLE IS FREE 
                OF VIRUSES OR OTHER HARMFUL COMPONENTS.
              </p>
              <p className="leading-relaxed mb-4">
                IN NO EVENT SHALL NOREVA, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR 
                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING 
                BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Loss of profits, revenue, or business</li>
                <li>Loss of data or digital assets</li>
                <li>Loss arising from unauthorized access to your wallet</li>
                <li>Trading losses or missed trading opportunities</li>
                <li>Smart contract failures or vulnerabilities</li>
                <li>Third-party service failures</li>
                <li>Network failures or blockchain issues</li>
              </ul>
              <p className="leading-relaxed">
                OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR YOUR 
                USE OF THE PLATFORM SHALL NOT EXCEED THE AMOUNT YOU PAID TO US (IF ANY) IN THE TWELVE (12) 
                MONTHS PRECEDING THE CLAIM.
              </p>
            </div>

            {/* Indemnification */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">9. Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless Noreva, its affiliates, and their 
                respective officers, directors, employees, agents, and successors from and against any 
                claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' 
                fees) arising out of or related to: (a) your use of the Platform; (b) your violation of 
                these Terms; (c) your violation of any rights of another party; or (d) your violation of 
                any applicable laws or regulations.
              </p>
            </div>

            {/* Service Availability */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">10. Service Availability</h2>
              <p className="leading-relaxed mb-4">
                We strive to maintain high availability of our Platform but do not guarantee uninterrupted 
                access. The Platform may be temporarily unavailable due to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Scheduled or emergency maintenance</li>
                <li>Software updates and upgrades</li>
                <li>Network or server issues</li>
                <li>External factors beyond our control</li>
                <li>Force majeure events</li>
              </ul>
              <p className="leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any part of the Platform at any 
                time without prior notice or liability.
              </p>
            </div>

            {/* Termination */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">11. Termination</h2>
              <p className="leading-relaxed mb-4">
                We reserve the right to terminate or suspend your access to the Platform at any time, 
                without prior notice or liability, for any reason, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Violation of these Terms</li>
                <li>Suspected fraudulent or illegal activity</li>
                <li>Request by law enforcement or government agencies</li>
                <li>Extended periods of inactivity</li>
                <li>Technical or security issues</li>
              </ul>
              <p className="leading-relaxed">
                Upon termination, your right to use the Platform will immediately cease. All provisions of 
                these Terms that by their nature should survive termination shall survive, including 
                ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </div>

            {/* Governing Law */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">12. Governing Law and Dispute Resolution</h2>
              <p className="leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with applicable laws, without 
                regard to conflict of law principles.
              </p>
              <p className="leading-relaxed mb-4">
                Any dispute arising out of or relating to these Terms or your use of the Platform shall be 
                resolved through good faith negotiations between the parties. If negotiations fail, the 
                dispute shall be submitted to binding arbitration.
              </p>
              <p className="leading-relaxed">
                YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ON AN INDIVIDUAL BASIS 
                AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION.
              </p>
            </div>

            {/* Modifications */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">13. Modifications to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. Material changes will be communicated 
                by updating the "Last Updated" date at the top of these Terms. Your continued use of the 
                Platform after any modifications constitutes acceptance of the updated Terms. If you do not 
                agree to the modified Terms, you must discontinue use of the Platform.
              </p>
            </div>

            {/* Severability */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">14. Severability</h2>
              <p className="leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision 
                shall be limited or eliminated to the minimum extent necessary so that these Terms shall 
                otherwise remain in full force and effect and enforceable.
              </p>
            </div>

            {/* Entire Agreement */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">15. Entire Agreement</h2>
              <p className="leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you 
                and Noreva regarding your use of the Platform and supersede all prior and contemporaneous 
                understandings, agreements, representations, and warranties.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">16. Contact Information</h2>
              <p className="leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us through:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Our official <a href="https://x.com/NorevaMarkets" target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline">X (Twitter) account</a></li>
                <li>Our GitHub repository</li>
              </ul>
            </div>

            {/* Agreement Box */}
            <div className="p-6 bg-[var(--background-card)] border border-[var(--border)] rounded-xl mt-8">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">Agreement Acknowledgment</h3>
              <p className="text-sm leading-relaxed mb-4">
                By using Noreva, you acknowledge that you have read, understood, and agree to be bound by 
                these Terms of Service. You also acknowledge that:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)]">•</span>
                  <span>You understand the risks associated with trading tokenized assets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)]">•</span>
                  <span>You are solely responsible for your trading decisions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)]">•</span>
                  <span>You will comply with all applicable laws and regulations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--accent)]">•</span>
                  <span>You have read and accept our Privacy Policy</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
