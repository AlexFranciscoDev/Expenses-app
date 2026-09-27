import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import { Input, Label } from '../components/ui/Field.jsx'
import { friendlyError } from '../constants/copy.js'
import { useAuth } from '../context/AuthContext.jsx'
import { signIn, signUp } from '../services/auth.js'

export default function LoginPage() {
  const { user } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  if (user) return <Navigate to="/" replace />

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password)
      } else {
        await signUp(email.trim(), password, name.trim() || null)
        setNotice('Account created. If email confirmation is enabled, check your inbox before logging in.')
        setMode('signin')
      }
    } catch (err) {
      setError(err?.message?.includes('Password') ? err.message : friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-brand-soft to-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-2xl font-bold text-white shadow-[0_10px_24px_rgb(47_107_255/0.35)]">
            L
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Ledger</h1>
          <p className="mt-1 text-sm text-muted">See where your money goes.</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-6 shadow-card">
          <h2 className="text-base font-semibold">{mode === 'signin' ? 'Log in' : 'Create your account'}</h2>
          {mode === 'signup' && (
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" placeholder="Alex" />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={mode === 'signup' ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>
          {error && <p role="alert" className="text-sm text-negative">{error}</p>}
          {notice && <p className="text-sm text-positive">{notice}</p>}
          <Button type="submit" size="lg" loading={loading} className="w-full">
            {mode === 'signin' ? 'Log in' : 'Create account'}
          </Button>
        </form>

        <p className="mt-5 text-center text-[13px] text-muted">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            className="font-semibold text-brand"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setNotice(null)
            }}
          >
            {mode === 'signin' ? 'Create one' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}
