import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { opportunitiesApi } from '../../api/opportunitiesApi'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { format, formatDistanceToNow } from 'date-fns'
import {
  CalendarIcon, BriefcaseIcon, DollarSignIcon, LinkIcon, MapPinIcon, TrashIcon,
  PlusIcon, FileTextIcon, SendIcon, XIcon, DownloadIcon, ShieldAlertIcon, ClockIcon
} from 'lucide-react'
import Modal from '../../components/ui/Modal'
import InterviewForm from './InterviewForm'

const TRANSITIONS_CONFIG = {
  APPLIED: { label: 'Mark as Applied', type: 'APPLIED', style: 'btn-primary from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600' },
  ASSESSMENT_RECEIVED: { label: 'Mark Assessment Received', type: 'ASSESSMENT', style: 'btn-primary from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-500 hover:to-fuchsia-600' },
  ASSESSMENT_COMPLETED: { label: 'Mark Assessment Completed', type: 'ASSESSMENT_COMPLETED', style: 'btn-primary from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600' },
  INTERVIEW_SCHEDULED: { label: 'Schedule Interview', type: 'INTERVIEW', style: 'btn-primary from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600' },
  INTERVIEW_COMPLETED: { label: 'Mark Interview Completed', type: 'INTERVIEW_COMPLETED', style: 'btn-primary from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600' },
  OFFER_RECEIVED: { label: 'Receive Job Offer', type: 'OFFER', style: 'btn-primary from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600' },
  ACCEPTED: { label: 'Accept Offer 🥳', type: 'ACCEPTED', style: 'btn-primary from-green-500 to-emerald-600' },
  REJECTED: { label: 'Mark Rejected', type: 'REJECTED', style: 'btn-secondary text-red-400 border-red-900/30 hover:bg-red-950/20' },
  DECLINED: { label: 'Decline Offer', type: 'DECLINED', style: 'btn-secondary text-gray-400 hover:bg-slate-950/30' },
  WITHDRAWN: { label: 'Withdraw Application', type: 'WITHDRAWN', style: 'btn-secondary text-gray-500 hover:bg-neutral-950/30' }
}

function calculateCareerHealth(opp, updatedAt) {
  if (!opp) return { score: 0, label: 'At Risk', color: 'text-red-500 bg-red-950/20' }
  const status = opp.currentStatus
  if (['REJECTED', 'DECLINED', 'WITHDRAWN'].includes(status)) {
    return { score: 35, label: 'At Risk / Inactive', color: 'text-red-400 bg-red-950/30 border-red-900/40' }
  }
  if (status === 'ACCEPTED') {
    return { score: 100, label: 'Excellent', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40' }
  }

  const daysSinceUpdate = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24))
  let score = 90

  if (daysSinceUpdate < 3) {
    score += 5
  } else if (daysSinceUpdate <= 7) {
    score -= 5
  } else if (daysSinceUpdate <= 14) {
    score -= 25
  } else {
    score -= 50
  }

  if (status === 'OFFER_RECEIVED') score += 10
  if (status === 'INTERVIEW_SCHEDULED' || status === 'INTERVIEW_COMPLETED') score += 5

  score = Math.max(10, Math.min(100, score))

  if (score >= 90) return { score, label: 'Excellent', color: 'text-emerald-400 bg-emerald-950/20 border-emerald-900/40' }
  if (score >= 70) return { score, label: 'Healthy', color: 'text-indigo-400 bg-indigo-950/20 border-indigo-900/40' }
  if (score >= 50) return { score, label: 'Needs Attention', color: 'text-yellow-400 bg-yellow-950/20 border-yellow-900/40' }
  return { score, label: 'At Risk', color: 'text-red-400 bg-red-950/20 border-red-900/40' }
}

export default function ApplicationDetailPanel({ id, onClose }) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Transition Form Entry states
  const [activeTransition, setActiveTransition] = useState(null)
  const [assessmentPayload, setAssessmentPayload] = useState({ deadlineDate: '' })
  const [interviewPayload, setInterviewPayload] = useState({ scheduledAt: '', interviewerName: '', platform: '', durationMinutes: 60, notes: '' })
  const [offerPayload, setOfferPayload] = useState({ salary: '', offerExpiryDate: '' })

  const [newNote, setNewNote] = useState('')
  const [selectedFileType, setSelectedFileType] = useState('RESUME')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  // Scheduling state for loops tab
  const [scheduleLoop, setScheduleLoop] = useState({
    roundType: 'Screening',
    platform: '',
    scheduledAt: '',
    notes: ''
  })

  // Fetch Data
  const { data: opp, isLoading: oppLoading } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => opportunitiesApi.getById(id),
    enabled: !!id
  })

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => opportunitiesApi.getNotes(id),
    enabled: !!id
  })

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => opportunitiesApi.getDocuments(id),
    enabled: !!id
  })

  const { data: timeline = [] } = useQuery({
    queryKey: ['timeline', id],
    queryFn: () => opportunitiesApi.getTimeline(id),
    enabled: !!id
  })

  const { data: calendarEvents = [], refetch: refetchCalendar } = useQuery({
    queryKey: ['opportunity-calendar-events', id],
    queryFn: () => opportunitiesApi.getCalendarEventsForOpportunity(id),
    enabled: !!id
  })

  // Reset local states on ID change
  useEffect(() => {
    setActiveTransition(null)
    setNewNote('')
    setSelectedFile(null)
    setUploadModalOpen(false)
    setScheduleLoop({
      roundType: 'Screening',
      platform: '',
      scheduledAt: '',
      notes: ''
    })
  }, [id])

  // Mutations
  const transitionMutation = useMutation({
    mutationFn: ({ type, payload }) => {
      switch (type) {
        case 'APPLIED':
          return opportunitiesApi.apply(id)
        case 'ASSESSMENT':
          return opportunitiesApi.receiveAssessment(id, {
            deadlineDate: payload.deadlineDate ? new Date(payload.deadlineDate).toISOString() : null
          })
        case 'ASSESSMENT_COMPLETED':
          return opportunitiesApi.completeAssessment(id)
        case 'INTERVIEW':
          return opportunitiesApi.scheduleInterview(id, {
            ...payload,
            scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt).toISOString() : null,
            durationMinutes: parseInt(payload.durationMinutes) || 60
          })
        case 'INTERVIEW_COMPLETED':
          return opportunitiesApi.completeInterview(id)
        case 'OFFER':
          return opportunitiesApi.receiveOffer(id, {
            salary: payload.salary,
            offerExpiryDate: payload.offerExpiryDate ? new Date(payload.offerExpiryDate).toISOString() : null
          })
        case 'ACCEPTED':
          return opportunitiesApi.acceptOffer(id)
        case 'REJECTED':
          return opportunitiesApi.reject(id)
        case 'DECLINED':
          return opportunitiesApi.declineOffer(id)
        case 'WITHDRAWN':
          return opportunitiesApi.withdraw(id)
        default:
          throw new Error('Unknown transition')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] })
      queryClient.invalidateQueries({ queryKey: ['timeline', id] })
      queryClient.invalidateQueries({ queryKey: ['opportunity-calendar-events', id] })
      queryClient.invalidateQueries({ queryKey: ['opportunities-all'] })
      queryClient.invalidateQueries({ queryKey: ['opportunities-list'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      setActiveTransition(null)
      refetchCalendar()
      toast.success('Stage updated successfully')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Workflow transition failed')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => opportunitiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities-all'] })
      queryClient.invalidateQueries({ queryKey: ['opportunities-list'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Application deleted')
      onClose()
    }
  })

  const addNoteMutation = useMutation({
    mutationFn: (content) => opportunitiesApi.createNote(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', id] })
      setNewNote('')
      toast.success('Note added')
    }
  })

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => opportunitiesApi.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', id] })
      toast.success('Note deleted')
    }
  })

  const uploadDocMutation = useMutation({
    mutationFn: () => opportunitiesApi.uploadDocument(id, selectedFileType, selectedFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] })
      setSelectedFile(null)
      setUploadModalOpen(false)
      toast.success('Document uploaded successfully')
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? 'Upload failed'
      toast.error(msg)
    }
  })

  const deleteDocMutation = useMutation({
    mutationFn: (docId) => opportunitiesApi.deleteDocument(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] })
      toast.success('Document deleted')
    }
  })

  function handleScheduleLoopSubmit(e) {
    e.preventDefault()
    if (!scheduleLoop.scheduledAt) {
      toast.error('Scheduled Date & Time is required')
      return
    }

    const selected = new Date(scheduleLoop.scheduledAt)
    if (isNaN(selected.getTime())) {
      toast.error('Invalid scheduled date & time')
      return
    }

    if (!scheduleLoop.platform.trim()) {
      toast.error('Meeting Link / Platform is required')
      return
    }

    if (scheduleLoop.notes && scheduleLoop.notes.length > 2000) {
      toast.error('Preparation notes must not exceed 2000 characters')
      return
    }

    transitionMutation.mutate({
      type: 'INTERVIEW',
      payload: {
        scheduledAt: scheduleLoop.scheduledAt,
        interviewerName: scheduleLoop.roundType,
        platform: scheduleLoop.platform.trim(),
        durationMinutes: 60,
        notes: scheduleLoop.notes.trim()
      }
    })

    setScheduleLoop({
      roundType: 'Screening',
      platform: '',
      scheduledAt: '',
      notes: ''
    })
  }

  function handleDocumentUploadSubmit(e) {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }
    if (!selectedFileType) {
      toast.error('Please select a document type')
      return
    }

    // Size limit 5MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit')
      return
    }

    // Format validation
    const ext = selectedFile.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx', 'doc', 'png', 'jpg', 'jpeg'].includes(ext)) {
      toast.error('File format not supported. Only PDF, DOCX, DOC, PNG, and JPEG are allowed')
      return
    }

    uploadDocMutation.mutate()
  }

  if (!id) return null

  const health = opp ? calculateCareerHealth(opp, opp.updatedAt) : { score: 0, label: 'At Risk', color: 'text-red-500 bg-red-950/20' }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-out Panel container */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="relative w-full max-w-2xl bg-darkSecondary border-l border-darkBorder shadow-2xl h-full flex flex-col z-55 overflow-hidden"
      >
        {oppLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <LoadingSpinner className="h-8 w-8 text-brand-500" />
          </div>
        ) : !opp ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-400">
            <ShieldAlertIcon size={48} className="text-red-500 mb-2" />
            <p>Application details not found.</p>
            <button onClick={onClose} className="btn-secondary mt-4">Close</button>
          </div>
        ) : (
          <>
            {/* Header info */}
            <div className="px-6 py-5 border-b border-darkBorder flex items-center justify-between bg-darkCard/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-brand-600/20 text-brand-400 font-extrabold flex items-center justify-center shrink-0 text-sm shadow-md border border-brand-500/10">
                  {opp.companyName ? opp.companyName.slice(0, 2).toUpperCase() : 'CP'}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-white tracking-tight truncate leading-tight">
                    {opp.roleName}
                  </h2>
                  <p className="text-xs text-gray-400 font-bold truncate mt-0.5">
                    {opp.companyName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    if (confirm('Delete this application permanently?')) deleteMutation.mutate()
                  }}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors border border-darkBorder"
                  title="Delete Application"
                >
                  <TrashIcon size={15} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-darkCard rounded-lg transition-colors border border-darkBorder"
                >
                  <XIcon size={15} />
                </button>
              </div>
            </div>

            {/* Health Score & Pipeline Stage Selector Row */}
            <div className="px-6 py-4 bg-darkCard/30 border-b border-darkBorder/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 bg-darkCard/80 border border-darkBorder/80 p-3 rounded-xl min-w-[200px]">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-black shrink-0 ${
                  health.label === 'Excellent' ? 'border-emerald-500 text-emerald-400' :
                  health.label === 'Healthy' ? 'border-indigo-500 text-indigo-400' :
                  health.label === 'Needs Attention' ? 'border-yellow-500 text-yellow-400' :
                  'border-red-500 text-red-400'
                }`}>
                  {opp.currentStatus === 'ACCEPTED' ? '100' : health.score}%
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block">Health Score</span>
                  <span className={`text-xs font-black ${
                    health.label === 'Excellent' ? 'text-emerald-400' :
                    health.label === 'Healthy' ? 'text-indigo-400' :
                    health.label === 'Needs Attention' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>{health.label}</span>
                </div>
              </div>

              {/* Stage select dropdown */}
              <div className="flex flex-col gap-1 min-w-[200px]">
                <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Pipeline Stage</span>
                <select
                  value={opp.currentStatus}
                  onChange={(e) => {
                    const target = e.target.value
                    if (target === opp.currentStatus) return
                    const conf = TRANSITIONS_CONFIG[target]
                    if (conf) {
                      if (['ASSESSMENT', 'INTERVIEW', 'OFFER'].includes(conf.type)) {
                        setActiveTransition(conf.type)
                      } else {
                        transitionMutation.mutate({ type: target })
                      }
                    }
                  }}
                  className="input text-xs font-bold py-2 px-3 bg-darkCard/80 border-darkBorder"
                >
                  <option value={opp.currentStatus} disabled>
                    {opp.currentStatus.replace(/_/g, ' ')} (Current)
                  </option>
                  {opp.allowedTransitions?.map(t => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-darkBorder bg-darkSecondary px-4 overflow-x-auto scrollbar-none whitespace-nowrap">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'timeline', label: 'Timeline' },
                { id: 'interviews', label: 'Interviews' },
                { id: 'notes', label: 'Notes' },
                { id: 'documents', label: 'Documents' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 px-4 py-3.5 text-xs font-bold tracking-wide transition-all border-b-2 uppercase ${
                    activeTab === tab.id
                      ? 'border-brand-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Tab Viewport */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Overlay transition detailed form prompts if active */}
              {activeTransition && (
                <div className="p-4 bg-darkCard border border-brand-500/30 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-darkBorder/40 pb-2">
                    <span className="text-xs font-bold text-brand-400 uppercase">Input details for {activeTransition} Stage</span>
                    <button
                      type="button"
                      onClick={() => setActiveTransition(null)}
                      className="text-gray-400 hover:text-white text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  {activeTransition === 'INTERVIEW' ? (
                    <InterviewForm
                      onSubmit={(payload) => {
                        transitionMutation.mutate({ type: 'INTERVIEW', payload })
                      }}
                      onCancel={() => setActiveTransition(null)}
                      isSubmitting={transitionMutation.isPending}
                      submitLabel="Confirm Stage Transition"
                    />
                  ) : (
                    <>
                      {activeTransition === 'ASSESSMENT' && (
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

                      {activeTransition === 'OFFER' && (
                        <div className="space-y-3">
                          <div>
                            <label className="label">Salary Package Offer *</label>
                            <input
                              type="text"
                              value={offerPayload.salary}
                              onChange={e => setOfferPayload(p => ({ ...p, salary: e.target.value }))}
                              className="input"
                              placeholder="e.g. $120,000 / yr"
                              required
                            />
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

                      <button
                        onClick={() => {
                          let payload = {}
                          if (activeTransition === 'ASSESSMENT') {
                            if (!assessmentPayload.deadlineDate) {
                              toast.error('Assessment deadline is required')
                              return
                            }
                            payload = assessmentPayload
                          }
                          if (activeTransition === 'OFFER') {
                            if (!offerPayload.salary.trim()) {
                              toast.error('Salary Package Offer is required')
                              return
                            }
                            payload = offerPayload
                          }
                          transitionMutation.mutate({ type: activeTransition, payload })
                        }}
                        disabled={transitionMutation.isPending}
                        className="btn-primary w-full justify-center"
                      >
                        {transitionMutation.isPending ? 'Updating Stage…' : 'Confirm Stage Transition'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* TAB: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Detailed specs */}
                  <div className="bg-darkCard rounded-xl border border-darkBorder p-5 space-y-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-darkBorder/40 pb-2">Application Metadata</h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Location</span>
                        <div className="flex items-center gap-1.5 text-gray-200">
                          <MapPinIcon size={14} className="text-gray-500" />
                          <span>{opp.location || 'No location set'}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Source</span>
                        <div className="flex items-center gap-1.5 text-gray-200">
                          <LinkIcon size={14} className="text-gray-500" />
                          <span>{opp.source || 'No source set'}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Salary Offer Details</span>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                          <DollarSignIcon size={14} />
                          <span>{opp.salary || 'No package details'}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Date Added</span>
                        <div className="flex items-center gap-1.5 text-gray-200">
                          <CalendarIcon size={14} className="text-gray-500" />
                          <span>{format(new Date(opp.createdAt), 'MMMM dd, yyyy')}</span>
                        </div>
                      </div>
                      {opp.applicationDate && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Application Date</span>
                          <div className="flex items-center gap-1.5 text-gray-200">
                            <CalendarIcon size={14} className="text-gray-500" />
                            <span>{format(new Date(opp.applicationDate), 'MMMM dd, yyyy')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stage transition controls list */}
                  <div className="bg-darkCard rounded-xl border border-darkBorder p-5 space-y-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-darkBorder/40 pb-2">Manage Stages</h3>
                    <div className="flex flex-wrap gap-2">
                      {opp.allowedTransitions?.length === 0 ? (
                        <p className="text-xs text-gray-400">Application has reached its final state.</p>
                      ) : (
                        opp.allowedTransitions.map(trans => {
                          const conf = TRANSITIONS_CONFIG[trans]
                          if (!conf) return null
                          return (
                            <button
                              key={trans}
                              onClick={() => {
                                if (['ASSESSMENT', 'INTERVIEW', 'OFFER'].includes(conf.type)) {
                                  setActiveTransition(conf.type)
                                } else {
                                  transitionMutation.mutate({ type: trans })
                                }
                              }}
                              className={`${conf.style} py-1.5 text-xs font-semibold`}
                            >
                              {conf.label}
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Journey Timeline */}
              {activeTab === 'timeline' && (
                <div className="bg-darkCard border border-darkBorder rounded-xl p-6 relative">
                  <div className="absolute top-8 bottom-8 left-10 w-0.5 bg-gradient-to-b from-brand-500 to-indigo-700/40"></div>
                  <div className="space-y-6">
                    {timeline.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">No journey history recorded.</p>
                    ) : (
                      timeline.map((item) => (
                        <div key={item.id} className="flex gap-4 relative z-10">
                          <div className="w-8 h-8 rounded-full bg-darkSecondary border-2 border-brand-500 flex items-center justify-center shrink-0 shadow-lg shadow-black/30">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-400"></div>
                          </div>
                          <div className="space-y-1 pt-0.5">
                            <p className="text-xs font-black text-white uppercase tracking-wider">
                              {item.eventType.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-gray-300 leading-relaxed">
                              {item.description}
                            </p>
                            <p className="text-[9px] text-gray-500 font-bold">
                              {format(new Date(item.createdAt), 'MMMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: Interviews */}
              {activeTab === 'interviews' && (
                <div className="space-y-6">
                  {/* SCHEDULE LOOPS FORM */}
                  <div className="card bg-darkCard border border-darkBorder p-5 space-y-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">SCHEDULE LOOPS</h3>
                    
                    <InterviewForm
                      onSubmit={(payload) => {
                        transitionMutation.mutate({ type: 'INTERVIEW', payload })
                      }}
                      hideCancel={true}
                      submitLabel="+ Add Round"
                      isSubmitting={transitionMutation.isPending}
                    />
                  </div>

                  {/* Scheduled Rounds List */}
                  {calendarEvents && calendarEvents.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-black">Upcoming Loops</h4>
                      <div className="space-y-2">
                        {calendarEvents
                          .filter(evt => evt.eventType === 'INTERVIEW_DATE')
                          .map(evt => (
                            <div key={evt.id} className="p-4 bg-darkCard border border-darkBorder rounded-xl flex items-start gap-4 hover:border-brand-500/25 transition-all">
                              <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl shrink-0">
                                <CalendarIcon size={16} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex justify-between items-start gap-2">
                                  <h5 className="text-xs font-black text-white truncate">{evt.title}</h5>
                                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                                    {format(new Date(evt.eventDate), 'MMM d, yyyy')}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1 whitespace-pre-wrap leading-relaxed">{evt.description}</p>
                                <div className="flex items-center gap-1 text-[9px] text-brand-400 font-bold mt-2">
                                  <ClockIcon size={10} />
                                  <span>{formatDistanceToNow(new Date(evt.eventDate), { addSuffix: true })}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-darkBorder/40 rounded-xl text-gray-500 text-xs">
                      No loops scheduled yet. Fill the scheduler above to add rounds.
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Prep Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (newNote.trim()) addNoteMutation.mutate(newNote)
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Attach interview prep details or context..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="input flex-1 py-2 px-3 bg-darkCard"
                    />
                    <button type="submit" className="btn-primary py-2 px-3 shrink-0">
                      <SendIcon size={14} /> Add Note
                    </button>
                  </form>

                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {notes.length === 0 ? (
                      <div className="text-center py-12 bg-darkCard/40 border border-dashed border-darkBorder rounded-xl text-gray-500">
                        <FileTextIcon size={28} className="mx-auto mb-2 text-gray-600" />
                        <p className="text-xs font-semibold">No preparation notes yet</p>
                      </div>
                    ) : (
                      notes.map(n => (
                        <div key={n.id} className="p-4 bg-darkCard border border-darkBorder rounded-xl flex justify-between items-start group relative hover:border-brand-500/35 transition-colors">
                          <div className="space-y-1.5 pr-6">
                            <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">
                              {format(new Date(n.createdAt), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteNoteMutation.mutate(n.id)}
                            className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-darkSecondary absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <TrashIcon size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: Documents */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-darkBorder/40 pb-3">
                    <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-black">Attachments</h4>
                    <button
                      onClick={() => {
                        setSelectedFile(null)
                        setUploadModalOpen(true)
                      }}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shrink-0 shadow-md"
                    >
                      <PlusIcon size={12} /> Upload Document
                    </button>
                  </div>

                  {/* Document List */}
                  <div className="space-y-2">
                    {documents.length === 0 ? (
                      <div className="text-center py-12 bg-darkCard/40 border border-dashed border-darkBorder rounded-xl text-gray-500">
                        <FileTextIcon size={28} className="mx-auto mb-2 text-gray-600" />
                        <p className="text-xs font-semibold">No uploaded attachments</p>
                      </div>
                    ) : (
                      documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3.5 bg-darkCard border border-darkBorder rounded-xl hover:border-brand-500/35 transition-colors">
                          <div className="min-w-0 flex items-center gap-3">
                            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg">
                              <FileTextIcon size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{doc.fileName}</p>
                              <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">{doc.fileType}</p>
                            </div>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <a
                              href={opportunitiesApi.downloadDocumentUrl(doc.id)}
                              download
                              className="p-1.5 bg-darkSecondary text-gray-400 hover:text-white rounded-lg hover:bg-darkBg transition-colors"
                              title="Download document"
                            >
                              <DownloadIcon size={12} />
                            </a>
                            <button
                              onClick={() => deleteDocMutation.mutate(doc.id)}
                              className="p-1.5 bg-darkSecondary text-gray-400 hover:text-red-400 rounded-lg hover:bg-darkBg transition-colors"
                            >
                              <TrashIcon size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>

      {/* DOCUMENT UPLOAD MODAL */}
      <Modal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Upload Document">
        <form onSubmit={handleDocumentUploadSubmit} className="space-y-4">
          <div>
            <label className="label">Document Type *</label>
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="input"
              required
            >
              <option value="RESUME">Resume</option>
              <option value="COVER_LETTER">Cover Letter</option>
              <option value="PORTFOLIO">Portfolio</option>
              <option value="CERTIFICATE">Certificate</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="label">Select File * (Max 5MB: PDF, DOCX, PNG, JPEG)</label>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0])
              }}
              className="hidden"
              id="upload-modal-file-input"
              required
            />
            <label
              htmlFor="upload-modal-file-input"
              className="btn-secondary w-full text-center justify-center cursor-pointer py-3.5 border-dashed"
            >
              {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose file...'}
            </label>
            {selectedFile && (
              <span className="text-[10px] text-gray-400 block mt-1.5 text-right font-semibold">
                Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary flex-1 justify-center py-2.5 font-bold"
              disabled={uploadDocMutation.isPending}
            >
              {uploadDocMutation.isPending ? 'Uploading...' : 'Confirm Upload'}
            </button>
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
