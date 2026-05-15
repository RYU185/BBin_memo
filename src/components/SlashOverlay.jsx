import { useState, useEffect } from 'react'
import SlashDropdown from './SlashDropdown'

export default function SlashOverlay({ theme = 'light' }) {
  const [state, setState] = useState({ query: '', selected: 0 })

  useEffect(() => {
    if (!window.api) return
    return window.api.slash.onState(setState)
  }, [])

  return (
    <div style={{ background: 'transparent', padding: 0, margin: 0 }}>
      <SlashDropdown
        theme={theme}
        query={state.query}
        selected={state.selected}
        onSelect={(cmd) => window.api?.slash.select(cmd.id)}
      />
    </div>
  )
}
