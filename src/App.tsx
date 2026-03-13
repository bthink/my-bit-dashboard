import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
      <h1 className="text-3xl font-semibold mb-4">Vite + React + TypeScript + Tailwind</h1>
      <p className="text-slate-600 mb-6">
        Edit <code className="px-2 py-1 bg-slate-200 rounded text-sm">src/App.tsx</code> and save to test HMR.
      </p>
      <button
        type="button"
        className="px-4 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors"
        onClick={() => setCount((c) => c + 1)}
      >
        Count is {count}
      </button>
    </div>
  )
}

export default App
