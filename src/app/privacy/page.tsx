export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: April 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white">What we collect</h2>
            <p>
              PodCraft collects only the information needed to provide the service:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account information:</strong> Email address (for sign-in), name, location, and country of origin (for personalizing podcast content and voice selection).</li>
              <li><strong>Podcast preferences:</strong> Your preferred style, length, voice, and subscription settings.</li>
              <li><strong>Generated content:</strong> Podcast scripts and audio files you create.</li>
              <li><strong>Feedback:</strong> Ratings and comments you provide about episodes.</li>
              <li><strong>Device tokens:</strong> Push notification tokens for delivering alerts about new episodes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">How we use it</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Generating personalized podcast content based on your preferences</li>
              <li>Sending notifications when your subscribed episodes are ready</li>
              <li>Improving content quality based on your feedback</li>
              <li>Authenticating your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Third-party services</h2>
            <p>PodCraft uses the following services to operate:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Anthropic (Claude):</strong> Script generation. Your topic and sources are sent to generate podcast scripts.</li>
              <li><strong>ElevenLabs:</strong> Text-to-speech. Scripts are converted to audio using their voice synthesis API.</li>
              <li><strong>Vercel:</strong> Hosting and storage. Your podcasts are stored securely on Vercel infrastructure.</li>
              <li><strong>Supabase:</strong> Database and authentication services.</li>
              <li><strong>Resend:</strong> Email delivery for sign-in links and notifications.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Data retention</h2>
            <p>
              Your account data is retained while your account is active. Generated podcasts are stored for as long as your account exists.
              You can delete individual podcasts or your entire account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Your rights</h2>
            <p>You can:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access all data associated with your account</li>
              <li>Delete individual podcasts or your entire account</li>
              <li>Opt out of email and push notifications</li>
              <li>Export your podcast data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Contact</h2>
            <p>
              For privacy-related inquiries, contact us at privacy@podcraft.app.
            </p>
          </section>
        </div>

        <div className="mt-8">
          <a href="/" className="text-brand-400 hover:text-brand-300 text-sm">
            Back to PodCraft
          </a>
        </div>
      </div>
    </main>
  );
}
