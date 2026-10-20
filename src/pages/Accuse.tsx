import { useState, type FormEvent } from 'react'
import { api } from '../api.ts'

// Option ids must match SOLUTION in server/flags.js.
const SUSPECTS = [
  { id: 'connor', label: 'Connor', avatar: '🧛' },
  { id: 'heather', label: 'Heather', avatar: '🧙' },
  { id: 'maryum', label: 'Maryum', avatar: '🥀' },
  { id: 'jonathan', label: 'Jonathan', avatar: '👻' },
  { id: 'ben', label: 'Ben', avatar: '🎂' },
  { id: 'shim', label: 'Shim', avatar: '🕷️' },
]

const METHODS = [
  { id: 'arsenic_latte', label: 'Arsenic in his latte' },
  { id: 'nightshade_latte', label: 'Deadly nightshade in his latte' },
  { id: 'nightshade_cake', label: 'Deadly nightshade in a birthday cupcake' },
  { id: 'stairs', label: 'Pushed down the east wing stairs' },
  { id: 'torch', label: 'Struck with a ghost-hunting torch' },
]

const MOTIVES = [
  { id: 'money', label: 'An unpaid poker debt' },
  { id: 'bens_party', label: 'He would not stop talking about Ben\'s birthday party' },
  { id: 'jealousy', label: 'Jealousy — he was Ben\'s favourite' },
  { id: 'secret', label: 'He discovered a secret at the manor' },
]

type Result = { correct: true; flag: string; epilogue: string[] } | { correct: false; message: string }

export default function Accuse() {
  const [killer, setKiller] = useState('')
  const [method, setMethod] = useState('')
  const [motive, setMotive] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setResult(null)
    try {
      setResult(await api.accuse({ killer, method, motive }))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (result?.correct) {
    return (
      <section className="card accuse-solved">
        <h2 className="card-title">⚖️ Case Closed</h2>
        {result.epilogue.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p className="muted">🕯️ Rest easy, James.</p>
        <code className="flag">{result.flag}</code>
      </section>
    )
  }

  return (
    <form className="card form-card accuse" onSubmit={submit}>
      <h2 className="card-title">⚖️ Make an Accusation</h2>
      <p className="muted">
        You've gathered the clues. Now tell the Ravenhollow Police who killed James, how, and why. Get any part
        wrong and they'll let your suspect walk.
      </p>

      <span className="label">Who killed James?</span>
      <div className="suspect-picker" role="radiogroup" aria-label="Killer">
        {SUSPECTS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={killer === s.id}
            className={killer === s.id ? 'selected' : ''}
            onClick={() => setKiller(s.id)}
          >
            <span className="avatar">{s.avatar}</span>
            {s.label}
          </button>
        ))}
      </div>

      <label>
        How did they do it?
        <select value={method} onChange={(e) => setMethod(e.target.value)} required>
          <option value="" disabled>
            Choose a method…
          </option>
          {METHODS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Why?
        <select value={motive} onChange={(e) => setMotive(e.target.value)} required>
          <option value="" disabled>
            Choose a motive…
          </option>
          {MOTIVES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </label>

      {result && !result.correct && <p className="error">{result.message}</p>}
      {error && <p className="error">{error}</p>}

      <button type="submit" className="btn btn-danger btn-block" disabled={busy || !killer || !method || !motive}>
        {busy ? 'Presenting your case…' : 'Accuse'}
      </button>
    </form>
  )
}
