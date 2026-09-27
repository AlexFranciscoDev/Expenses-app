import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Download, LogOut, Tags } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { Input, Label } from '../components/ui/Field.jsx'
import { friendlyError } from '../constants/copy.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { signOut, updateProfile } from '../services/auth.js'
import { exportTransactionsCsv } from '../services/export.js'

function RowButton({ icon: Icon, label, hint, onClick, to, tone = '' }) {
  const content = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-subtle text-ink-soft">
        <Icon size={17} />
      </span>
      <span className="flex-1">
        <span className={`block text-sm font-medium ${tone}`}>{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
      <ChevronRight size={16} className="text-muted" />
    </>
  )
  const className = 'flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left hover:bg-subtle'
  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { profile, setProfile, categories, categoriesById } = useData()
  const toast = useToast()
  const [name, setName] = useState(profile?.display_name ?? '')
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  const saveName = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      setProfile(await updateProfile(user.id, { display_name: name.trim() || null }))
      toast('Profile updated')
    } catch (err) {
      toast(friendlyError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const exportCsv = async () => {
    setExporting(true)
    try {
      const count = await exportTransactionsCsv(categoriesById)
      toast(`Exported ${count} transactions`)
    } catch (err) {
      toast(friendlyError(err), 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Settings" />

      <Card className="mb-4 p-5">
        <form onSubmit={saveName}>
          <Label htmlFor="display-name">Your name</Label>
          <div className="flex gap-2">
            <Input id="display-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className="flex-1" />
            <Button type="submit" variant="secondary" loading={saving}>
              Save
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted">{user?.email}</p>
        </form>
      </Card>

      <Card className="mb-4 p-2">
        <RowButton icon={Tags} label="Categories" hint={`${categories.length} categories`} to="/settings/categories" />
        <RowButton
          icon={Download}
          label={exporting ? 'Exporting…' : 'Export transactions (CSV)'}
          hint="Download a backup of all your data"
          onClick={exportCsv}
        />
      </Card>

      <Card className="p-2">
        <RowButton icon={LogOut} label="Log out" tone="text-negative" onClick={() => signOut().catch((e) => toast(friendlyError(e), 'error'))} />
      </Card>
    </div>
  )
}
