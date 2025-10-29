"use client"

export default function LoginForm() {
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const btn = form.querySelector('button') as HTMLButtonElement
    btn.disabled = true
    try {
      const res = await fetch('/api/auth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Failed to send magic link')
      alert('Check your email for a magic link!')
    } catch (err) {
      alert('Failed to send magic link')
    } finally {
      btn.disabled = false
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <input
        type="email"
        name="email"
        placeholder="you@example.com"
        required
        className="w-full rounded border px-3 py-2"
      />
      <button type="submit" className="w-full rounded bg-black px-4 py-2 text-white">Send magic link</button>
    </form>
  )
}


