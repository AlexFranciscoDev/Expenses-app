export default function SetupPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-line bg-surface p-6 shadow-card">
        <h1 className="mb-2 text-lg font-semibold">Connect Supabase</h1>
        <p className="text-sm leading-relaxed text-muted">
          Create a <code className="rounded bg-subtle px-1">.env.local</code> file with{' '}
          <code className="rounded bg-subtle px-1">VITE_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-subtle px-1">VITE_SUPABASE_ANON_KEY</code>, then restart the dev server. See the README for details.
        </p>
      </div>
    </div>
  )
}
