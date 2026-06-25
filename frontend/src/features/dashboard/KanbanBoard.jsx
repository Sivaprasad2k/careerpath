import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { opportunitiesApi } from '../../api/opportunitiesApi'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import ApplicationDetailPanel from '../opportunities/ApplicationDetailPanel'
import InterviewForm from '../opportunities/InterviewForm'
import toast from 'react-hot-toast'
import { CalendarIcon, BriefcaseIcon, DollarSignIcon, UserIcon, MapPinIcon, PlusIcon, HeartIcon, ClockIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const COLUMNS = [
  { key: 'APPLIED', label: 'Applied', statuses: ['APPLIED'] },
  { key: 'ASSESSMENT', label: 'Assessment', statuses: ['ASSESSMENT_RECEIVED', 'ASSESSMENT_COMPLETED'] },
  { key: 'INTERVIEW', label: 'Interview', statuses: ['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'] },
  { key: 'OFFER', label: 'Offer', statuses: ['OFFER_RECEIVED', 'ACCEPTED'] },
  { key: 'REJECTED', label: 'Rejected', statuses: ['REJECTED', 'DECLINED', 'WITHDRAWN'] }
]

function getCardHealth(opp) {
  if (['REJECTED', 'DECLINED', 'WITHDRAWN'].includes(opp.currentStatus)) return { score: 35, label: 'At Risk', color: 'text-red-400 border-red-500/30 bg-red-950/10' }
  if (opp.currentStatus === 'ACCEPTED') return { score: 100, label: 'Excellent', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/10' }

  const days = Math.floor((Date.now() - new Date(opp.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
  let score = 90
  if (days < 3) score += 5
  else if (days <= 7) score -= 5
  else if (days <= 14) score -= 25
  else score -= 50

  if (opp.currentStatus === 'OFFER_RECEIVED') score += 10
  if (opp.currentStatus === 'INTERVIEW_SCHEDULED' || opp.currentStatus === 'INTERVIEW_COMPLETED') score += 5
  score = Math.max(10, Math.min(100, score))

  if (score >= 90) return { score, label: 'Excellent', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/10' }
  if (score >= 70) return { score, label: 'Healthy', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/10' }
  if (score >= 50) return { score, label: 'Needs Attention', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-950/10' }
  return { score, label: 'At Risk', color: 'text-red-400 border-red-500/30 bg-red-950/10' }
}


export default function KanbanBoard({ opportunities }) {
  const queryClient = useQueryClient()
  const [activeDragId, setActiveDragId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [selectedOppId, setSelectedOppId] = useState(null)
  const [selectedColumnKey, setSelectedColumnKey] = useState('APPLIED')

  // Transition Modal states
  const [targetOpp, setTargetOpp] = useState(null)
  const [transitionType, setTransitionType] = useState(null) // 'ASSESSMENT', 'INTERVIEW', 'OFFER'
  const [modalOpen, setModalOpen] = useState(false)

  // Modals payloads
  const [assessmentPayload, setAssessmentPayload] = useState({ deadlineDate: '' })
  const [interviewPayload, setInterviewPayload] = useState({ scheduledAt: '', interviewerName: '', platform: '', durationMinutes: 60, notes: '' })
  const [offerPayload, setOfferPayload] = useState({ salary: '', offerExpiryDate: '' })

  const transitionMutation = useMutation({
    mutationFn: ({ id, type, payload }) => {
      switch (type) {
        case 'APPLIED':
          return opportunitiesApi.apply(id)
        case 'ASSESSMENT':
          return opportunitiesApi.receiveAssessment(id, {
            deadlineDate: payload.deadlineDate ? new Date(payload.deadlineDate).toISOString() : null
          })
        case 'INTERVIEW':
          return opportunitiesApi.scheduleInterview(id, {
            ...payload,
            scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt).toISOString() : null,
            durationMinutes: parseInt(payload.durationMinutes) || 60
          })
        case 'OFFER':
          return opportunitiesApi.receiveOffer(id, {
            salary: payload.salary,
            offerExpiryDate: payload.offerExpiryDate ? new Date(payload.offerExpiryDate).toISOString() : null
          })
        case 'REJECTED':
          return opportunitiesApi.reject(id)
        default:
          throw new Error('Unknown transition')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities-all'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      setModalOpen(false)
      toast.success('Application status updated')
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? 'Workflow transition failed'
      toast.error(msg)
    }
  })

  function handleDragStart(e, id) {
    e.dataTransfer.setData('opportunityId', id)
    setActiveDragId(id)
  }

  function handleDragEnd() {
    setActiveDragId(null)
    setDragOverCol(null)
  }

  function handleDrop(e, columnKey) {
    e.preventDefault()
    setDragOverCol(null)
    const oppId = e.dataTransfer.getData('opportunityId')
    const opp = opportunities.find(o => o.id === oppId)
    if (!opp) return

    const isAlreadyInCol = COLUMNS.find(c => c.key === columnKey)?.statuses.includes(opp.currentStatus)
    if (isAlreadyInCol) return

    if (columnKey === 'APPLIED') {
      transitionMutation.mutate({ id: oppId, type: 'APPLIED' })
    } else if (columnKey === 'REJECTED') {
      transitionMutation.mutate({ id: oppId, type: 'REJECTED' })
    } else {
      setTargetOpp(opp)
      setTransitionType(columnKey)
      setModalOpen(true)
    }
  }

  function handleModalSubmit(e) {
    e.preventDefault()
    let payload = {}
    if (transitionType === 'ASSESSMENT') {
      if (!assessmentPayload.deadlineDate) {
        toast.error('Assessment deadline is required')
        return
      }
      payload = assessmentPayload
    }
    if (transitionType === 'INTERVIEW') {
      if (!interviewPayload.scheduledAt) {
        toast.error('Scheduled Date & Time is required')
        return
      }
      const selected = new Date(interviewPayload.scheduledAt)
      if (isNaN(selected.getTime())) {
        toast.error('Invalid scheduled date & time')
        return
      }
      if (!interviewPayload.platform.trim()) {
        toast.error('Platform / Meeting Link is required')
        return
      }
      if (interviewPayload.notes && interviewPayload.notes.length > 2000) {
        toast.error('Notes must not exceed 2000 characters')
        return
      }
      payload = interviewPayload
    }
    if (transitionType === 'OFFER') {
      if (!offerPayload.salary.trim()) {
        toast.error('Salary package offer is required')
        return
      }
      payload = offerPayload
    }

    transitionMutation.mutate({
      id: targetOpp.id,
      type: transitionType,
      payload
    })
  }


  return (
    <div className="space-y-4 w-full">
      {/* Mobile Column Tabs Selector */}
      <div className="flex md:hidden gap-1.5 overflow-x-auto pb-3 mb-2 scrollbar-none">
        {COLUMNS.map(col => {
          const colOpps = opportunities.filter(o => col.statuses.includes(o.currentStatus))
          const isActive = selectedColumnKey === col.key
          return (
            <button
              key={col.key}
              onClick={() => setSelectedColumnKey(col.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                isActive 
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/10' 
                  : 'bg-darkSecondary text-gray-400 border-darkBorder hover:text-white'
              }`}
            >
              {col.label} ({colOpps.length})
            </button>
          )
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-5 md:overflow-x-auto pb-6 select-none min-h-[65vh] items-stretch md:items-start">
        {COLUMNS.map(col => {
          const colOpps = opportunities.filter(o => col.statuses.includes(o.currentStatus))
          const isOver = dragOverCol === col.key

          return (
            <div
              key={col.key}
              onDragOver={(e) => {
                e.preventDefault()
                if (dragOverCol !== col.key) setDragOverCol(col.key)
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`w-full md:flex-1 md:min-w-[270px] md:max-w-[340px] rounded-2xl p-4.5 transition-all duration-300 border ${
                selectedColumnKey === col.key ? 'block' : 'hidden md:block'
              } ${
                isOver
                  ? 'bg-brand-500/5 border-brand-500/30 shadow-lg shadow-brand-500/5'
                  : 'bg-darkSecondary/50 border-darkBorder/60'
              }`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-4.5 px-1">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{col.label}</span>
                <span className="text-[10px] font-black px-2 py-0.5 bg-darkCard text-gray-300 border border-darkBorder rounded-lg shadow-inner">
                  {colOpps.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {colOpps.map(opp => {
                  const health = getCardHealth(opp)
                  return (
                    <motion.div
                      key={opp.id}
                      layoutId={`card-${opp.id}`}
                      whileHover={{ y: -3, scale: 1.01 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, opp.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedOppId(opp.id)}
                      className="card bg-darkCard/95 p-4.5 border border-darkBorder/80 cursor-grab active:cursor-grabbing hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 group relative overflow-hidden"
                    >
                      {/* Glowing Accent Border on Hover */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      {/* Row 1: Company (small uppercase) & priority dot */}
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[10px] font-extrabold text-gray-500 tracking-wider uppercase truncate">
                          {opp.companyName}
                        </span>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          opp.priority === 'HIGH' ? 'bg-red-500 shadow-md shadow-red-500/30 animate-pulse' : opp.priority === 'MEDIUM' ? 'bg-amber-500 shadow-md shadow-amber-500/30' : 'bg-blue-400 shadow-md shadow-blue-400/30'
                        }`} title={`${opp.priority} Priority`} />
                      </div>
                      
                      {/* Row 2: Role name (larger bold white) */}
                      <h4 className="text-sm font-extrabold text-white group-hover:text-brand-400 transition-colors mt-1.5 truncate">
                        {opp.roleName}
                      </h4>

                      {/* Horizontal Divider */}
                      <div className="border-t border-darkBorder/40 my-3.5" />

                      {/* Row 3: Updated time (left) & health score pct (right) */}
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold mt-2">
                        <span className="flex items-center gap-1.5 truncate">
                          <ClockIcon size={11} className="text-gray-500 shrink-0" />
                          {formatDistanceToNow(new Date(opp.updatedAt), { addSuffix: false })} ago
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 ${health.color}`}>
                          {health.score}%
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
                {colOpps.length === 0 && (
                  <div className="text-center py-10 border border-dashed border-darkBorder/30 rounded-xl bg-darkSecondary/20 hover:bg-darkSecondary/35 hover:border-darkBorder/50 transition-all flex items-center justify-center">
                    <span className="text-[10px] font-black text-gray-600 tracking-widest uppercase">
                      DROP HERE
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Sliding Detail Panel Experience ───────────────────────────── */}
      <AnimatePresence>
        {selectedOppId && (
          <ApplicationDetailPanel
            id={selectedOppId}
            onClose={() => setSelectedOppId(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Transition Inputs Modal ────────────────────────────────────── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Move to ${transitionType}`}>
        {transitionType === 'INTERVIEW' ? (
          <InterviewForm
            onSubmit={(payload) => {
              transitionMutation.mutate({
                id: targetOpp.id,
                type: 'INTERVIEW',
                payload
              })
            }}
            onCancel={() => setModalOpen(false)}
            isSubmitting={transitionMutation.isPending}
          />
        ) : (
          <form onSubmit={handleModalSubmit} className="space-y-4">
            {transitionType === 'ASSESSMENT' && (
              <div>
                <label className="label">Assessment Deadline</label>
                <input
                  type="datetime-local"
                  value={assessmentPayload.deadlineDate}
                  onChange={e => setAssessmentPayload({ deadlineDate: e.target.value })}
                  className="input"
                  required
                />
              </div>
            )}

            {transitionType === 'OFFER' && (
              <div className="space-y-4">
                <div>
                  <label className="label">Salary Package Offer *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSignIcon size={14} className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={offerPayload.salary}
                      onChange={e => setOfferPayload(p => ({ ...p, salary: e.target.value }))}
                      className="input pl-8"
                      placeholder="e.g. $120,000 / yr"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Offer Expiration Date</label>
                  <input
                    type="datetime-local"
                    value={offerPayload.offerExpiryDate}
                    onChange={e => setOfferPayload(p => ({ ...p, offerExpiryDate: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={transitionMutation.isPending}
                className="btn-primary flex-1 justify-center"
              >
                {transitionMutation.isPending ? 'Updating…' : 'Confirm Stage Move'}
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
        )}
      </Modal>
    </div>
  )
}

