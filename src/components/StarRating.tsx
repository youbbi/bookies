import { useState, useCallback } from 'react'

interface StarRatingProps {
  value: number | null
  onChange?: (rating: number | null) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

export function StarRating({ value, onChange, size = 'md', readonly = false }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const displayValue = hoverValue ?? value ?? 0

  const handleClick = useCallback(
    (rating: number) => {
      if (readonly || !onChange) return
      // Clicking the same rating clears it
      onChange(rating === value ? null : rating)
    },
    [readonly, onChange, value]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (readonly || !onChange) return

      const currentValue = value ?? 0

      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault()
        const newValue = Math.min(5, currentValue + 1)
        onChange(newValue === 0 ? 1 : newValue)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault()
        const newValue = Math.max(0, currentValue - 1)
        onChange(newValue === 0 ? null : newValue)
      }
    },
    [readonly, onChange, value]
  )

  const handleMouseLeave = useCallback(() => {
    if (!readonly) {
      setHoverValue(null)
    }
  }, [readonly])

  return (
    <div
      className="flex gap-1"
      role="group"
      aria-label="Note"
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={readonly ? undefined : 0}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHoverValue(star)}
          disabled={readonly}
          className={`${sizeClasses[size]} transition-colors ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
          aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
          aria-pressed={value === star}
        >
          <svg
            viewBox="0 0 24 24"
            fill={star <= displayValue ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.5}
            className={star <= displayValue ? 'text-warm-amber' : 'text-cream-300'}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      ))}
    </div>
  )
}
