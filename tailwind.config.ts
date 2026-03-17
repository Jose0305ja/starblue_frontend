import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sb: {
          bg:       '#07090F',
          bg2:      '#0D1220',
          bg3:      '#131929',
          blue:     '#3D56D4',
          'blue-lt':'#5B74F0',
          green:    '#22C55E',
          orange:   '#F59E0B',
          purple:   '#A78BFA',
          red:      '#EF4444',
          cyan:     '#06B6D4',
          text:     '#E8EDF8',
          muted:    '#8891A8',
        },
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.07)',
        border2: 'rgba(255,255,255,0.12)',
      },
    },
  },
  plugins: [],
}

export default config
