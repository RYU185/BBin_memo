import { useState, useEffect } from 'react'
import './index.css'
import HubWindow from './components/HubWindow'
import MemoWindow from './components/MemoWindow'

export default function App() {
  const [params, setParams] = useState(null)

  useEffect(() => {
    if (window.api) {
      setParams(window.api.getWindowParams())
    } else {
      // dev fallback: show hub
      setParams({ type: 'hub', memoId: null })
    }
  }, [])

  if (!params) return null

  const theme = 'light'

  if (params.type === 'memo' && params.memoId) {
    return <MemoWindow memoId={params.memoId} theme={theme} />
  }

  return <HubWindow theme={theme} />
}
