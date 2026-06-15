import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { opportunitiesApi } from '../../api/opportunitiesApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import KanbanBoard from './KanbanBoard'
import { useAuthStore } from '../../store/authStore'
import { BriefcaseIcon, CalendarIcon, AwardIcon, PlusIcon } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import CreateOpportunityForm from '../opportunities/CreateOpportunityForm'
import toast from 'react-hot-toast'

// Simple robust count-up component
function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = parseInt(value)
    if (isNaN(end) || end <= 0) {
      setCount(0)
      return
    }
    const duration = 1000 // 1s
    const increment = Math.ceil(end / 30) // step increment
    const intervalTime = duration / 30

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, intervalTime)

    return () => clearInterval(timer)
  }, [value])

  return <span>{count}</span>
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)

  const { data: opportunitiesData, isLoading: oppsLoading } = useQuery({
    queryKey: ['opportunities-all'],
    queryFn:  () => opportunitiesApi.list({ page: 0, size: 200, sort: 'updatedAt,desc' }),
  })

  const createMutation = useMutation({
    mutationFn: opportunitiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities-list'] })
      queryClient.invalidateQueries({ queryKey: ['opportunities-all'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      setCreateOpen(false)
      toast.success('Application created successfully')
    },
    onError: () => toast.error('Failed to create application'),
  })

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hr = new Date().getHours()
    if (hr < 12) return 'Good morning'
    if (hr < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (oppsLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LoadingSpinner className="h-10 w-10 text-brand-500" />
      </div>
    )
  }

  const opportunities = opportunitiesData?.content ?? []

  // Re-calculated metrics
  const activeApplications = opportunities.filter(
    o => !['REJECTED', 'ACCEPTED', 'DECLINED', 'WITHDRAWN'].includes(o.currentStatus)
  ).length

  const upcomingInterviews = opportunities.filter(
    o => o.currentStatus === 'INTERVIEW_SCHEDULED'
  ).length

  const offersAwaiting = opportunities.filter(
    o => o.currentStatus === 'OFFER_RECEIVED'
  ).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* ── Premium Header Card Container ────────────────────────────── */}
      <div className="card bg-gradient-to-br from-darkCard to-darkSecondary/80 border border-darkBorder/80 p-6 md:p-8 rounded-2xl relative overflow-hidden shadow-2xl">
        {/* Glow detail background */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
        
        {/* Header Title Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              {getGreeting()}, {user?.name || 'Shevay'}
            </h1>
            <p className="text-xs md:text-sm text-gray-400 font-semibold max-w-xl">
              Track your applications, interviews, and offers from one intelligent workspace.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="btn-primary shrink-0 self-start md:self-auto flex items-center gap-2"
          >
            <PlusIcon size={16} /> Add Application
          </button>
        </div>

        {/* Nested Horizontal Metric Counters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {/* Active Applications */}
          <div className="bg-darkBg/60 border border-darkBorder/80 p-4 rounded-xl flex items-center gap-4 hover:border-brand-500/30 transition-all duration-300">
            <div className="p-3 bg-brand-500/10 text-brand-400 rounded-lg shrink-0">
              <BriefcaseIcon size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Active Applications</span>
              <div className="text-xl font-black text-white mt-0.5">
                <AnimatedCounter value={activeApplications} />
              </div>
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="bg-darkBg/60 border border-darkBorder/80 p-4 rounded-xl flex items-center gap-4 hover:border-brand-500/30 transition-all duration-300">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-lg shrink-0">
              <CalendarIcon size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Upcoming Interviews</span>
              <div className="text-xl font-black text-white mt-0.5">
                <AnimatedCounter value={upcomingInterviews} />
              </div>
            </div>
          </div>

          {/* Offers Awaiting Decision */}
          <div className="bg-darkBg/60 border border-darkBorder/80 p-4 rounded-xl flex items-center gap-4 hover:border-brand-500/30 transition-all duration-300">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
              <AwardIcon size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Offers Awaiting Decision</span>
              <div className="text-xl font-black text-white mt-0.5">
                <AnimatedCounter value={offersAwaiting} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Kanban Board Pipeline Section ────────────────────────────── */}
      <div className="space-y-4 pt-2">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Application Pipeline</h2>
        <KanbanBoard opportunities={opportunities} />
      </div>

      {/* ── Add Application Modal ────────────────────────────────────── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Application">
        <CreateOpportunityForm
          onSubmit={createMutation.mutate}
          loading={createMutation.isPending}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>
    </motion.div>
  )
}
