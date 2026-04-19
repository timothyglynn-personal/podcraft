export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="glass-card p-8">
          <div className="text-4xl mb-4">&#9993;</div>
          <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-gray-400">
            We sent you a sign-in link. Click it to continue to PodCraft.
          </p>
          <a
            href="/"
            className="inline-block mt-6 text-brand-400 hover:text-brand-300 text-sm transition-colors"
          >
            Back to PodCraft
          </a>
        </div>
      </div>
    </div>
  );
}
