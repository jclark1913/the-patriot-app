type IconName =
  | 'arrow-right'
  | 'arrow-left'
  | 'external'
  | 'shuffle'
  | 'book'
  | 'star'
  | 'star-outline'

export function Icon({
  name,
  className = '',
}: {
  name: IconName
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`icon ${className}`}
    >
      {name === 'arrow-right' && <path d="M4 12h15m-6-6 6 6-6 6" />}
      {name === 'arrow-left' && <path d="M20 12H5m6-6-6 6 6 6" />}
      {name === 'external' && (
        <>
          <path d="M14 4h6v6m0-6-9 9" />
          <path d="M10 5H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-5" />
        </>
      )}
      {name === 'shuffle' && (
        <>
          <path d="m4 5 3 0c5 0 5 14 10 14h3m-4-4 4 4-4 3M4 19h3c5 0 5-14 10-14h3m-4-3 4 3-4 4" />
        </>
      )}
      {name === 'book' && (
        <>
          <path d="M12 6C8 3 4 4 3 5v14c3-2 6-1 9 1 3-2 6-3 9-1V5c-1-1-5-2-9 1Zm0 0v14" />
          <path d="m6 8 3 1m6 0 3-1" />
        </>
      )}
      {(name === 'star' || name === 'star-outline') && (
        <path
          d="m12 2 2.8 6.2 6.7.8-5 4.6 1.4 6.7-5.9-3.4-5.9 3.4 1.4-6.7-5-4.6 6.7-.8Z"
          fill={name === 'star' ? 'currentColor' : 'none'}
          stroke={name === 'star' ? 'none' : 'currentColor'}
        />
      )}
    </svg>
  )
}
