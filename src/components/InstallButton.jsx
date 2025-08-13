import React from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export default function InstallButton() {
  const prompt = useInstallPrompt()
  if (!prompt) return null
  return (
    <button
      onClick={() => prompt.prompt()}
      title="Installa app"
      className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors duration-200"
    >
      Installa
    </button>
  )
}


