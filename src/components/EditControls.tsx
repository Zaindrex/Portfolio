import { FiEdit2, FiPlus } from 'react-icons/fi'
import { useEditor, type ContentPath } from '../data/ContentContext'

// On-page studio controls. They render nothing unless you're logged in to the
// studio (?studio), so visitors never see them. The parent must be `relative`.

export function EditButton({ path, label = 'Edit', className = 'top-4 right-4' }: { path: ContentPath; label?: string; className?: string }) {
  const editor = useEditor()
  if (!editor) return null
  const active = editor.active === path.join('.')
  return (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-shadow duration-300 ${
          active ? 'shadow-[inset_0_0_0_2px_#ff8a1f]' : 'shadow-[inset_0_0_0_1px_rgb(255_138_31/0.18)]'
        }`}
      />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          editor.open(path)
        }}
        className={`absolute z-30 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-xs font-medium shadow-lg shadow-black/50 backdrop-blur transition-all ${
          active ? 'border-accent bg-accent text-ink' : 'border-accent/50 bg-ink/85 text-accent hover:bg-accent hover:text-ink'
        } ${className}`}
      >
        <FiEdit2 /> {label}
      </button>
    </>
  )
}

export function AddButton({ listPath, label, className = 'w-full' }: { listPath: ContentPath; label: string; className?: string }) {
  const editor = useEditor()
  if (!editor) return null
  return (
    <button
      type="button"
      onClick={() => editor.add(listPath)}
      className={`flex items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-accent/30 py-6 font-sans text-sm text-accent/80 transition-colors hover:border-accent/70 hover:bg-accent/5 hover:text-accent ${className}`}
    >
      <FiPlus /> {label}
    </button>
  )
}
