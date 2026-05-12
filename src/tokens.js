export function tokens(isDark) {
  return {
    bg:          isDark ? '#0F0F11'                    : '#F3F3F1',
    surface:     isDark ? '#161618'                    : '#FAFAF8',
    surfaceAlt:  isDark ? '#1F1F22'                    : '#FFFFFF',
    text:        isDark ? '#F4F4F5'                    : '#15151A',
    subtle:      isDark ? '#86868A'                    : '#7A7A80',
    border:      isDark ? 'rgba(255,255,255,0.06)'     : 'rgba(0,0,0,0.06)',
    borderStrong:isDark ? 'rgba(255,255,255,0.08)'     : 'rgba(0,0,0,0.08)',
    hoverFill:   isDark ? 'rgba(255,255,255,0.07)'     : 'rgba(0,0,0,0.05)',
    accentFill:  isDark ? '#F4F4F5'                    : '#15151A',
    accentText:  isDark ? '#0F0F11'                    : '#FAFAF8',
    dropdownBg:  isDark ? '#202024'                    : '#FFFFFF',
    codeBg:      isDark ? 'rgba(255,255,255,0.08)'     : 'rgba(0,0,0,0.05)',
    windowShadow: isDark
      ? '0 30px 60px -20px rgba(0,0,0,0.65), 0 0 0 0.5px rgba(255,255,255,0.04)'
      : '0 30px 60px -20px rgba(15,15,20,0.18), 0 4px 12px -2px rgba(15,15,20,0.06)',
    dropdownShadow: isDark
      ? '0 16px 40px -10px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04)'
      : '0 16px 40px -10px rgba(15,15,20,0.18), 0 2px 6px -2px rgba(15,15,20,0.08)',
  }
}
