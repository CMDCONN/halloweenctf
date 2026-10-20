import { AVATARS } from '../api.ts'

export default function AvatarPicker({ value, onChange }: { value: string; onChange: (avatar: string) => void }) {
  return (
    <div className="avatar-picker" role="radiogroup" aria-label="Avatar">
      {AVATARS.map((a) => (
        <button
          key={a}
          type="button"
          role="radio"
          aria-checked={value === a}
          className={value === a ? 'selected' : ''}
          onClick={() => onChange(a)}
        >
          {a}
        </button>
      ))}
    </div>
  )
}
