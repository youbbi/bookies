export function TreeDecorations() {
  return (
    <div className="tree-decorations" aria-hidden="true">
      {/* Small potted plant - top */}
      <svg className="tree-decoration tree-decoration--plant-top" viewBox="0 0 40 50" fill="none">
        <ellipse cx="20" cy="45" rx="12" ry="5" fill="#8B6F47" />
        <rect x="12" y="35" width="16" height="12" rx="2" fill="#A67C52" />
        <path
          d="M20 35 C20 25 12 20 8 22 C12 18 18 15 20 10 C22 15 28 18 32 22 C28 20 20 25 20 35"
          fill="#7A9B76"
        />
        <path d="M20 32 C20 24 26 20 28 24 C26 20 22 16 20 12" fill="#6B8A67" />
      </svg>

      {/* Trailing vine - left */}
      <svg className="tree-decoration tree-decoration--vine-left" viewBox="0 0 60 120" fill="none">
        <path
          d="M30 0 C25 20 35 40 25 60 C15 80 35 100 30 120"
          stroke="#7A9B76"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="28" cy="25" r="4" fill="#8AAB86" />
        <circle cx="32" cy="50" r="3" fill="#7A9B76" />
        <circle cx="24" cy="75" r="5" fill="#8AAB86" />
        <circle cx="30" cy="100" r="4" fill="#7A9B76" />
      </svg>

      {/* Small leaves cluster - right */}
      <svg
        className="tree-decoration tree-decoration--leaves-right"
        viewBox="0 0 50 40"
        fill="none"
      >
        <ellipse cx="15" cy="20" rx="10" ry="6" fill="#7A9B76" transform="rotate(-30 15 20)" />
        <ellipse cx="25" cy="15" rx="8" ry="5" fill="#8AAB86" transform="rotate(15 25 15)" />
        <ellipse cx="35" cy="22" rx="10" ry="6" fill="#6B8A67" transform="rotate(-15 35 22)" />
        <ellipse cx="25" cy="28" rx="7" ry="4" fill="#7A9B76" transform="rotate(10 25 28)" />
      </svg>

      {/* Small succulent - bottom */}
      <svg className="tree-decoration tree-decoration--succulent" viewBox="0 0 30 35" fill="none">
        <ellipse cx="15" cy="32" rx="10" ry="3" fill="#8B6F47" />
        <rect x="8" y="25" width="14" height="8" rx="2" fill="#A67C52" />
        <ellipse cx="15" cy="22" rx="4" ry="6" fill="#7A9B76" />
        <ellipse cx="10" cy="20" rx="3" ry="5" fill="#8AAB86" transform="rotate(-20 10 20)" />
        <ellipse cx="20" cy="20" rx="3" ry="5" fill="#8AAB86" transform="rotate(20 20 20)" />
        <ellipse cx="8" cy="18" rx="2" ry="4" fill="#6B8A67" transform="rotate(-40 8 18)" />
        <ellipse cx="22" cy="18" rx="2" ry="4" fill="#6B8A67" transform="rotate(40 22 18)" />
      </svg>
    </div>
  )
}
