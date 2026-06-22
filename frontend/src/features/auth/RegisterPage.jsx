import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/authApi'
import toast from 'react-hot-toast'
import { CompassIcon } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const { setAuth }           = useAuthStore()
  const navigate              = useNavigate()

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(err => ({ ...err, [e.target.name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await authApi.register(form)
      setAuth(data)
      toast.success('Welcome to CareerPath!')
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.data?.error === 'VALIDATION_FAILED') {
        setErrors(err.response.data.data ?? {})
      } else {
        toast.error(err.response?.data?.message ?? 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-4 relative overflow-hidden">
      {/* ── Background Glowing Orbs ────────────────────────────────────── */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -60, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-80 h-80 rounded-full bg-brand-600/20 bg-orb -top-20 -left-20"
      />
      <motion.div
        animate={{
          x: [0, -30, 50, 0],
          y: [0, 50, -40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-96 h-96 rounded-full bg-indigo-500/10 bg-orb -bottom-20 -right-20"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card w-full max-w-md p-6 sm:p-8 bg-darkCard/80 backdrop-blur-xl border border-darkBorder/80 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-3">
            <CompassIcon size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">CareerPath</h1>
          <p className="text-xs text-gray-400 font-semibold tracking-wider mt-1 uppercase">Navigate Your Career. Own Your Future.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input"
              placeholder="Jane Smith"
              required
            />
            {errors.name && <p className="error-msg">{errors.name}</p>}
          </div>
          <div>
            <label className="label">Email address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="input"
              placeholder="you@example.com"
              required
            />
            {errors.email && <p className="error-msg">{errors.email}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="input"
              placeholder="Min. 8 characters"
              required
            />
            {errors.password && <p className="error-msg">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="btn-primary w-full justify-center py-2.5 mt-2"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 font-bold hover:text-brand-400 transition-colors hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

