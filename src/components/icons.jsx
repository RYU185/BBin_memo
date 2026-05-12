export const Search = (p) => (
  <svg viewBox="0 0 16 16" fill="none" {...p}>
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.25" />
    <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
)

export const Plus = (p) => (
  <svg viewBox="0 0 16 16" fill="none" {...p}>
    <path d="M8 3.25V12.75M3.25 8H12.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

export const Minus = (p) => (
  <svg viewBox="0 0 12 12" fill="none" {...p}>
    <path d="M3 6H9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
)

export const Close = (p) => (
  <svg viewBox="0 0 12 12" fill="none" {...p}>
    <path d="M3.25 3.25L8.75 8.75M8.75 3.25L3.25 8.75" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
)

export const Grip = (p) => (
  <svg viewBox="0 0 10 16" fill="none" {...p}>
    <circle cx="3" cy="4" r="0.8" fill="currentColor" />
    <circle cx="7" cy="4" r="0.8" fill="currentColor" />
    <circle cx="3" cy="8" r="0.8" fill="currentColor" />
    <circle cx="7" cy="8" r="0.8" fill="currentColor" />
    <circle cx="3" cy="12" r="0.8" fill="currentColor" />
    <circle cx="7" cy="12" r="0.8" fill="currentColor" />
  </svg>
)

export const MoreVert = (p) => (
  <svg viewBox="0 0 16 16" fill="none" {...p}>
    <circle cx="8" cy="3.5" r="1.1" fill="currentColor" />
    <circle cx="8" cy="8" r="1.1" fill="currentColor" />
    <circle cx="8" cy="12.5" r="1.1" fill="currentColor" />
  </svg>
)

export const MoreHoriz = (p) => (
  <svg viewBox="0 0 16 16" fill="none" {...p}>
    <circle cx="3.5" cy="8" r="1.1" fill="currentColor" />
    <circle cx="8" cy="8" r="1.1" fill="currentColor" />
    <circle cx="12.5" cy="8" r="1.1" fill="currentColor" />
  </svg>
)

export const Trash = (p) => (
  <svg viewBox="0 0 16 16" fill="none" {...p}>
    <path d="M3 5H13M6 5V3.5C6 3.22 6.22 3 6.5 3H9.5C9.78 3 10 3.22 10 3.5V5M4.5 5L5 12.5C5 12.78 5.22 13 5.5 13H10.5C10.78 13 11 12.78 11 12.5L11.5 5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Pin = (p) => (
  <svg viewBox="0 0 14 14" fill="none" {...p}>
    <path d="M8.6 1.6L12.4 5.4L10 6L7.8 11.2L2.8 6.2L8 4L8.6 1.6Z" stroke="currentColor" strokeWidth="1.05" strokeLinejoin="round" />
    <path d="M5 9L1.5 12.5" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
  </svg>
)

export const PinFilled = (p) => (
  <svg viewBox="0 0 14 14" fill="none" {...p}>
    <path d="M8.6 1.6L12.4 5.4L10 6L7.8 11.2L2.8 6.2L8 4L8.6 1.6Z" fill="currentColor" stroke="currentColor" strokeWidth="1.05" strokeLinejoin="round" />
    <path d="M5 9L1.5 12.5" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
  </svg>
)

export const Bold = (p) => (
  <svg viewBox="0 0 14 14" fill="none" {...p}>
    <path d="M4 2.5H8.25C9.49 2.5 10.5 3.51 10.5 4.75C10.5 5.99 9.49 7 8.25 7H4V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M4 7H8.75C10.13 7 11.25 8.12 11.25 9.5C11.25 10.88 10.13 11.5 8.75 11.5H4V7Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
)

export const Underline = (p) => (
  <svg viewBox="0 0 14 14" fill="none" {...p}>
    <path d="M4 2.5V7.5C4 9.16 5.34 10.5 7 10.5C8.66 10.5 10 9.16 10 7.5V2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M3 12.5H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

export const Checkbox = (p) => (
  <svg viewBox="0 0 14 14" fill="none" {...p}>
    <rect x="2.5" y="2.5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M5 7L6.5 8.5L9 5.75" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Strike = (p) => (
  <svg viewBox="0 0 14 14" fill="none" {...p}>
    <path d="M4 4.25C4 3.28 5 2.5 6.5 2.5C7.7 2.5 8.6 3 9 3.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M5 9.5C5 10.5 6 11.5 7.5 11.5C9 11.5 10 10.7 10 9.5C10 8.7 9.6 8.2 9 7.85" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M2.5 7H11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

export const List = (p) => (
  <svg viewBox="0 0 16 16" fill="none" {...p}>
    <path d="M4 5H12M4 8H12M4 11H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

export const Palette = (p) => (
  <svg viewBox="0 0 16 16" fill="none" {...p}>
    <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M2.5 7H13.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)
