import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-[clamp(24px,5vw,48px)] font-bold uppercase leading-none tracking-tight mb-2 text-black dark:text-white">Privacy Policy</h1>
          <p className="text-xs font-bold uppercase text-black/60 dark:text-white/60 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Introduction</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Welcome to The Urban Manual ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6 text-black dark:text-white">Personal Information</h3>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, or otherwise contact us. The personal information we collect may include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Name and email address</li>
                <li>Username and password</li>
                <li>Profile information (display name, bio, location, profile photo)</li>
                <li>Travel preferences and interests</li>
                <li>Reviews, ratings, and comments you post</li>
                <li>Lists and collections you create</li>
                <li>Destinations you save or mark as visited</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6 text-black dark:text-white">Automatically Collected Information</h3>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                When you visit our website, we automatically collect certain information about your device, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                <li>IP address and browser type</li>
                <li>Operating system and device information</li>
                <li>Pages you visit and time spent on pages</li>
                <li>Referring URLs and clickstream data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">How We Use Your Information</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                We use the information we collect or receive to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Provide, operate, and maintain our website and services</li>
                <li>Create and manage your account</li>
                <li>Process your transactions and send related information</li>
                <li>Send you notifications about your activity and interactions</li>
                <li>Provide personalized recommendations and content</li>
                <li>Respond to your comments, questions, and customer service requests</li>
                <li>Analyze usage trends and improve our services</li>
                <li>Detect, prevent, and address technical issues and fraudulent activity</li>
                <li>Send you marketing and promotional communications (with your consent)</li>
                <li>Comply with legal obligations and enforce our terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Sharing Your Information</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                We may share your information in the following situations:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Public Information:</strong> Your profile information, reviews, ratings, lists, and activity may be visible to other users based on your privacy settings</li>
                <li><strong>Service Providers:</strong> We may share your information with third-party service providers who perform services on our behalf (e.g., hosting, analytics, email delivery)</li>
                <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with a merger, sale, or acquisition</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to valid requests by public authorities</li>
                <li><strong>Affiliate Partners:</strong> We may share information with affiliate partners for monetization purposes, but will not sell your personal information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Cookies and Tracking Technologies</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with small amounts of data that are sent to your browser from a website and stored on your device.
              </p>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                We use the following types of cookies:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
                <li><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Third-Party Services</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Our website may contain links to third-party websites and services, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Google AdSense:</strong> For displaying advertisements</li>
                <li><strong>Awin Affiliate Network:</strong> For affiliate marketing links</li>
                <li><strong>Supabase:</strong> For authentication and database services</li>
                <li><strong>Google Gemini API:</strong> For AI-powered recommendations</li>
                <li><strong>Analytics Services:</strong> For website analytics and insights</li>
              </ul>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                These third-party services have their own privacy policies. We are not responsible for the privacy practices of these third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Data Security</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Your Privacy Rights</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Restriction:</strong> Request restriction of processing your information</li>
                <li><strong>Portability:</strong> Request transfer of your information to another service</li>
                <li><strong>Objection:</strong> Object to our processing of your information</li>
                <li><strong>Withdraw Consent:</strong> Withdraw your consent at any time</li>
              </ul>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Children's Privacy</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">International Data Transfers</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our website, you consent to such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Changes to This Privacy Policy</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date. You are advised to review this privacy policy periodically for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Contact Us</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="mb-2"><strong>The Urban Manual</strong></p>
                <p className="mb-2">Email: privacy@theurbanmanual.com</p>
                <p>Website: https://theurbanmanual.com</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">GDPR Compliance (EU Users)</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                If you are located in the European Economic Area (EEA), you have certain data protection rights under the General Data Protection Regulation (GDPR). We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your personal information.
              </p>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                The legal basis for processing your information includes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Your consent</li>
                <li>Performance of a contract with you</li>
                <li>Compliance with legal obligations</li>
                <li>Our legitimate interests</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">CCPA Privacy Rights (California Users)</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Right to know what personal information is collected</li>
                <li>Right to know whether personal information is sold or disclosed</li>
                <li>Right to say no to the sale of personal information</li>
                <li>Right to access your personal information</li>
                <li>Right to equal service and price</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
}

