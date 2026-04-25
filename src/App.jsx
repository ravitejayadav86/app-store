import { useState, useEffect } from 'react'
import './App.css'

const API = 'http://localhost:5000/api'

// Sample apps data (used when backend isn't connected)
const SAMPLE_APPS = [
  { _id: '1', name: 'PhotoSnap', category: 'Photography', price: 0, rating: 4.8, description: 'Edit photos like a pro with AI-powered tools.', developer: 'SnapLabs', image: '📸' },
  { _id: '2', name: 'BeatMaker', category: 'Music', price: 4.99, rating: 4.5, description: 'Create beats and music tracks on the go.', developer: 'RhythmCo', image: '🎵' },
  { _id: '3', name: 'FitTrack', category: 'Health', price: 0, rating: 4.7, description: 'Track workouts and reach your fitness goals.', developer: 'FitnessPro', image: '💪' },
  { _id: '4', name: 'CodePad', category: 'Productivity', price: 9.99, rating: 4.9, description: 'Mobile IDE for developers on the move.', developer: 'DevTools Inc', image: '💻' },
  { _id: '5', name: 'MindSpace', category: 'Health', price: 2.99, rating: 4.6, description: 'Meditation and mindfulness made simple.', developer: 'ZenApps', image: '🧘' },
  { _id: '6', name: 'ChefMate', category: 'Food', price: 0, rating: 4.4, description: 'Discover recipes based on what\'s in your fridge.', developer: 'CookTech', image: '🍳' },
  { _id: '7', name: 'SketchBoard', category: 'Design', price: 7.99, rating: 4.8, description: 'Professional sketching and illustration tool.', developer: 'ArtStudio', image: '🎨' },
  { _id: '8', name: 'TravelPal', category: 'Travel', price: 0, rating: 4.3, description: 'Plan trips, find deals, explore the world.', developer: 'WanderCo', image: '✈️' },
]

const CATEGORIES = ['All', 'Photography', 'Music', 'Health', 'Productivity', 'Food', 'Design', 'Travel']

export default function App() {
  const [apps, setApps] = useState(SAMPLE_APPS)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [modal, setModal] = useState(null) // 'login' | 'register' | app object
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('panda_user')
    if (saved) setUser(JSON.parse(saved))
    fetchApps()
  }, [])

  async function fetchApps() {
    try {
      const res = await fetch(`${API}/apps`)
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) setApps(data)
      }
    } catch { /* use sample data */ }
  }

  async function handleAuth(type) {
    setError('')
    setLoading(true)
    try {
      const body = type === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }

      const res = await fetch(`${API}/auth/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      localStorage.setItem('panda_user', JSON.stringify(data.user))
      localStorage.setItem('panda_token', data.token)
      setUser(data.user)
      setModal(null)
      setForm({ name: '', email: '', password: '' })
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('panda_user')
    localStorage.removeItem('panda_token')
    setUser(null)
  }

  const filtered = apps.filter(app => {
    const matchCat = category === 'All' || app.category === category
    const matchSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🐼</span>
            <span className="logo-text">Panda<b>Store</b></span>
          </div>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search"
              placeholder="Search apps..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="auth-buttons">
            {user ? (
              <div className="user-info">
                <span className="user-avatar">{user.name?.[0]?.toUpperCase()}</span>
                <span className="user-name">{user.name}</span>
                <button className="btn btn-ghost" onClick={logout}>Logout</button>
              </div>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={() => { setModal('login'); setError('') }}>Login</button>
                <button className="btn btn-primary" onClick={() => { setModal('register'); setError('') }}>Sign Up</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Amazing Apps</h1>
          <p>Your one-stop store for the best apps, curated by the Panda team 🐼</p>
        </div>
        <div className="hero-art">🐼</div>
      </section>

      {/* Categories */}
      <div className="categories">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-btn ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Apps Grid */}
      <main className="main">
        <div className="section-header">
          <h2>{category === 'All' ? 'All Apps' : category}</h2>
          <span className="count">{filtered.length} apps</span>
        </div>
        {filtered.length === 0 ? (
          <div className="empty">
            <span>🔎</span>
            <p>No apps found for "{search}"</p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map(app => (
              <div key={app._id} className="card" onClick={() => setModal(app)}>
                <div className="card-icon">{app.image || '📦'}</div>
                <div className="card-body">
                  <div className="card-top">
                    <h3>{app.name}</h3>
                    <span className={`badge ${app.category?.toLowerCase()}`}>{app.category}</span>
                  </div>
                  <p className="card-desc">{app.description}</p>
                  <div className="card-footer">
                    <span className="rating">⭐ {app.rating}</span>
                    <span className="price">{app.price === 0 ? 'Free' : `$${app.price}`}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <button className="close" onClick={() => setModal(null)}>✕</button>

            {modal === 'login' && (
              <>
                <h2>Welcome Back 🐼</h2>
                <p className="modal-sub">Login to your Panda Store account</p>
                {error && <div className="alert">{error}</div>}
                <div className="form">
                  <input placeholder="Email" type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} />
                  <input placeholder="Password" type="password" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} />
                  <button className="btn btn-primary full" disabled={loading}
                    onClick={() => handleAuth('login')}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
                <p className="switch-auth">Don't have an account?{' '}
                  <span onClick={() => { setModal('register'); setError('') }}>Sign up</span>
                </p>
              </>
            )}

            {modal === 'register' && (
              <>
                <h2>Join Panda Store 🐼</h2>
                <p className="modal-sub">Create your free account today</p>
                {error && <div className="alert">{error}</div>}
                <div className="form">
                  <input placeholder="Full Name" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                  <input placeholder="Email" type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} />
                  <input placeholder="Password" type="password" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} />
                  <button className="btn btn-primary full" disabled={loading}
                    onClick={() => handleAuth('register')}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </div>
                <p className="switch-auth">Already have an account?{' '}
                  <span onClick={() => { setModal('login'); setError('') }}>Login</span>
                </p>
              </>
            )}

            {modal && modal._id && (
              <>
                <div className="app-detail-icon">{modal.image || '📦'}</div>
                <h2>{modal.name}</h2>
                <p className="modal-sub">by {modal.developer}</p>
                <div className="detail-meta">
                  <span className={`badge ${modal.category?.toLowerCase()}`}>{modal.category}</span>
                  <span className="rating">⭐ {modal.rating}</span>
                  <span className="price">{modal.price === 0 ? 'Free' : `$${modal.price}`}</span>
                </div>
                <p className="detail-desc">{modal.description}</p>
                <button className="btn btn-primary full" onClick={() => {
                  if (!user) { setModal('login') }
                  else alert(`✅ "${modal.name}" installed successfully!`)
                }}>
                  {modal.price === 0 ? '⬇ Install Free' : `💳 Buy for $${modal.price}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <span>🐼 Panda Store © 2025 — Made with ❤️</span>
      </footer>
    </div>
  )
}