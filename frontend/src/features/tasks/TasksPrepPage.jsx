import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquareIcon, PlusIcon, TrashIcon, BookOpenIcon, CheckCircle2Icon } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import Modal from '../../components/ui/Modal'

const INITIAL_TASKS = [
  { id: '1', text: 'Practice 2 Medium LeetCode Questions', done: true, dueDate: '2026-06-18' },
  { id: '2', text: 'Refine STAR method examples for behavioral interviews', done: false, dueDate: '' },
  { id: '3', text: 'System Design: Learn CDN & Load Balancers architecture', done: false, dueDate: '' },
  { id: '4', text: 'Tailor resume for the upcoming Technical Interview rounds', done: true, dueDate: '2026-06-16' },
]

export default function TasksPrepPage() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('careerpath_tasks')
    return saved ? JSON.parse(saved) : INITIAL_TASKS
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [newTaskText, setNewTaskText] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    localStorage.setItem('careerpath_tasks', JSON.stringify(tasks))
  }, [tasks])

  function handleAddTaskSubmit(e) {
    e.preventDefault()
    const errs = {}

    if (!newTaskText.trim()) {
      errs.title = 'Task title is required'
    } else if (newTaskText.trim().length > 255) {
      errs.title = 'Task title must not exceed 255 characters'
    }

    if (dueDate) {
      const selected = new Date(dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selected < today) {
        errs.dueDate = 'Due date cannot be in the past'
      }
    }

    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    const task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      done: false,
      dueDate: dueDate || null
    }

    setTasks([...tasks, task])
    setNewTaskText('')
    setDueDate('')
    setErrors({})
    setModalOpen(false)
    toast.success('Task added successfully')
  }

  function handleToggleTask(id) {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function handleDeleteTask(id) {
    setTasks(tasks.filter(t => t.id !== id))
    toast.success('Task deleted')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="border-b border-darkBorder/40 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase tracking-wider text-xs font-black text-gray-400">Tasks & Prep</h1>
          <p className="text-xs text-gray-500 font-bold mt-1">Manage your active check-lists and access premium interview prep guides</p>
        </div>
        <button
          onClick={() => {
            setErrors({})
            setNewTaskText('')
            setDueDate('')
            setModalOpen(true)
          }}
          className="btn-primary flex items-center gap-2 shrink-0"
        >
          <PlusIcon size={16} /> Create Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Manager Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card bg-darkCard/50 border border-darkBorder/80 p-5 space-y-4">
            <h2 className="text-sm font-black text-white tracking-tight flex items-center gap-2 border-b border-darkBorder/40 pb-3">
              <CheckSquareIcon size={16} className="text-brand-500" />
              Active Checklists
            </h2>

            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {tasks.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-8">All tasks completed! Nice work.</p>
                ) : (
                  tasks.map(t => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between p-3.5 bg-darkSecondary/60 border border-darkBorder rounded-xl hover:border-brand-500/20 transition-all duration-200 group"
                    >
                      <label className="flex items-center gap-3 cursor-pointer select-none min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={t.done}
                          onChange={() => handleToggleTask(t.id)}
                          className="w-4.5 h-4.5 rounded border-darkBorder text-brand-600 focus:ring-brand-500 bg-darkBg"
                        />
                        <div className="min-w-0 flex-1">
                          <span className={`text-xs font-semibold block truncate ${t.done ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                            {t.text}
                          </span>
                          {t.dueDate && (
                            <span className="text-[9px] font-bold text-brand-400 block mt-0.5">
                              Due: {format(new Date(t.dueDate), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(t.id)}
                        className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-darkCard transition-opacity opacity-0 group-hover:opacity-100 ml-2"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Prep Guidelines Vault */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <BookOpenIcon size={12} />
            Prep Resources
          </h2>

          {/* STAR framework card */}
          <div className="card bg-darkCard/50 border border-darkBorder/80 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">STAR Method</span>
            </div>
            <h4 className="font-extrabold text-white text-sm">Behavioral Interview Structure</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Answer behavioral questions with high impact using this structure:
            </p>
            <ul className="space-y-1.5 text-xs text-gray-400 font-semibold pl-1">
              <li className="flex gap-2"><CheckCircle2Icon size={12} className="text-brand-500 shrink-0 mt-0.5" /> <strong>S:</strong> Situation (Context)</li>
              <li className="flex gap-2"><CheckCircle2Icon size={12} className="text-brand-500 shrink-0 mt-0.5" /> <strong>T:</strong> Task (Responsibility)</li>
              <li className="flex gap-2"><CheckCircle2Icon size={12} className="text-brand-500 shrink-0 mt-0.5" /> <strong>A:</strong> Action (Your contributions)</li>
              <li className="flex gap-2"><CheckCircle2Icon size={12} className="text-brand-500 shrink-0 mt-0.5" /> <strong>R:</strong> Result (Quantifiable outcome)</li>
            </ul>
          </div>

          {/* System Design card */}
          <div className="card bg-darkCard/50 border border-darkBorder/80 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/10">Architecture</span>
            </div>
            <h4 className="font-extrabold text-white text-sm">System Design Cheatsheet</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Key topics to double check before high stakes system design architecture loops:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Scalability', 'Load Balancers', 'Caching', 'Database Sharding', 'Microservices', 'CDN'].map(tag => (
                <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded border border-darkBorder bg-darkSecondary text-gray-400">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Prep Task">
        <form onSubmit={handleAddTaskSubmit} className="space-y-4">
          <div>
            <label className="label">Task Title *</label>
            <input
              type="text"
              placeholder="e.g. Mock interview with mentor, review behavioral notes"
              value={newTaskText}
              onChange={(e) => {
                setNewTaskText(e.target.value)
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }))
              }}
              className="input"
              required
            />
            {errors.title && <p className="error-msg">{errors.title}</p>}
          </div>

          <div>
            <label className="label">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value)
                if (errors.dueDate) setErrors(prev => ({ ...prev, dueDate: '' }))
              }}
              className="input"
            />
            {errors.dueDate && <p className="error-msg">{errors.dueDate}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center py-2.5 font-bold">
              Create Task
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
