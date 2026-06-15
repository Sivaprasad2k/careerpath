import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { opportunitiesApi } from '../../api/opportunitiesApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import {
  CalendarIcon, BriefcaseIcon, ClockIcon, SearchIcon, FilterIcon,
  CheckCircle2Icon, AlertCircleIcon, AwardIcon, FileTextIcon, HistoryIcon
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import axios from 'axios'

// Helper to return status-specific icon
function getStatusIcon(eventType) {
  const type = eventType.toUpperCase()
  if (type.includes('CREATE')) return <PlusIcon size={14} className="text-blue-400" />
  if (type.includes('APPLY') || type.includes('APPLIED')) return <CheckCircle2Icon size={14} className="text-indigo-400" />
  if (type.includes('ASSESSMENT')) return <FileTextIcon size={14} className="text-purple-400" />
  if (type.includes('INTERVIEW')) return <CalendarIcon size={14} className="text-violet-400" />
  if (type.includes('OFFER') || type.includes('ACCEPT')) return <AwardIcon size={14} className="text-emerald-400" />
  if (type.includes('REJECT') || type.includes('DECLINE') || type.includes('WITHDRAW')) return <AlertCircleIcon size={14} className="text-red-400" />
  return <HistoryIcon size={14} className="text-gray-400" />
}

export default function CareerTimelinePage() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [pageSize, setPageSize] = useState(15)

  // 1. Fetch opportunities to build lookup map
  const { data: opportunitiesData, isLoading: oppsLoading } = useQuery({
    queryKey: ['opportunities-all'],
    queryFn: () => opportunitiesApi.list({ page: 0, size: 200 }),
  })
  const opps = opportunitiesData?.content ?? []
  const oppMap = new Map(opps.map(o => [o.id, o]))

  // 2. Fetch global timeline events using custom API mapping
  const { data: timeline = [], isLoading: timelineLoading } = useQuery({
    queryKey: ['global-timeline'],
    queryFn: () => axios.get('/api/v1/timeline').then(r => r.data.data),
  })

  if (oppsLoading || timelineLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoadingSpinner className="text-brand-500 w-8 h-8" />
      </div>
    )
  }

  // Filter and map timeline events
  const filteredEvents = timeline
    .map(evt => {
      const opp = oppMap.get(evt.opportunityId)
      return {
        ...evt,
        oppCompanyName: opp?.companyName || 'Unknown Company',
        oppRoleName: opp?.roleName || 'Unknown Role'
      }
    })
    .filter(evt => {
      const matchesSearch = evt.description.toLowerCase().includes(search.toLowerCase()) ||
                            evt.oppCompanyName.toLowerCase().includes(search.toLowerCase()) ||
                            evt.oppRoleName.toLowerCase().includes(search.toLowerCase())

      if (filterType === 'ALL') return matchesSearch
      if (filterType === 'APPLICATIONS') return matchesSearch && (evt.eventType.includes('CREATE') || evt.eventType.includes('APPLY'))
      if (filterType === 'ASSESSMENTS') return matchesSearch && evt.eventType.includes('ASSESSMENT')
      if (filterType === 'INTERVIEWS') return matchesSearch && evt.eventType.includes('INTERVIEW')
      if (filterType === 'OFFERS') return matchesSearch && (evt.eventType.includes('OFFER') || evt.eventType.includes('ACCEPT'))
      if (filterType === 'INACTIVE') return matchesSearch && (evt.eventType.includes('REJECT') || evt.eventType.includes('DECLINE') || evt.eventType.includes('WITHDRAW'))
      return matchesSearch
    })

  const paginatedEvents = filteredEvents.slice(0, pageSize)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="border-b border-darkBorder/40 pb-6">
        <h1 className="text-2xl font-black text-white tracking-tight uppercase tracking-wider text-xs font-black text-gray-400">Career Journey Timeline</h1>
        <p className="text-xs text-gray-500 font-bold mt-1">Chronological journey of your applications, interviews, milestones, and achievements</p>
      </div>

      {/* Filter and search parameters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <SearchIcon size={14} />
          </div>
          <input
            type="text"
            placeholder="Search company, role or log details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input text-xs font-bold w-40"
          >
            <option value="ALL">All Events</option>
            <option value="APPLICATIONS">Applications</option>
            <option value="ASSESSMENTS">Assessments</option>
            <option value="INTERVIEWS">Interviews</option>
            <option value="OFFERS">Offers</option>
            <option value="INACTIVE">Rejections/Withdrawals</option>
          </select>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title={search || filterType !== 'ALL' ? "No matching timeline logs" : "No journey logged yet"}
          description={search || filterType !== 'ALL' ? "Try adjusting your query filters." : "Your application milestones and transitions will appear here chronologically."}
        />
      ) : (
        <div className="space-y-6">
          {/* Visual Timeline Feed */}
          <div className="bg-darkCard/30 border border-darkBorder/60 rounded-2xl p-6 md:p-8 relative">
            {/* Timeline center line */}
            <div className="absolute top-10 bottom-10 left-9 w-0.5 bg-gradient-to-b from-brand-500/80 via-indigo-600/40 to-transparent pointer-events-none" />

            <div className="space-y-8">
              {paginatedEvents.map((event) => (
                <div key={event.id} className="flex gap-5 relative z-10 group">
                  {/* Status Circle Icon */}
                  <div className="w-8 h-8 rounded-full bg-darkSecondary border border-darkBorder flex items-center justify-center shrink-0 shadow-lg shadow-black/40 group-hover:border-brand-500/50 transition-colors">
                    {getStatusIcon(event.eventType)}
                  </div>

                  {/* Log Content Card */}
                  <div className="flex-1 min-w-0 bg-darkCard/55 border border-darkBorder/70 p-4.5 rounded-xl hover:border-brand-500/20 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
                          {event.oppCompanyName}
                        </span>
                        <span className="text-xs font-black text-white block mt-0.5 truncate">
                          {event.oppRoleName}
                        </span>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-1.5 text-[10px] text-brand-400 font-black uppercase">
                        <ClockIcon size={11} />
                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                      </div>
                    </div>

                    <div className="border-t border-darkBorder/40 mt-3 pt-2">
                      <p className="text-xs text-gray-300 leading-relaxed font-semibold">
                        {event.description}
                      </p>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                        Event: {event.eventType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[9px] text-gray-500 font-bold">
                        {format(new Date(event.createdAt), 'PPP p')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Load More Button */}
          {filteredEvents.length > pageSize && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setPageSize(prev => prev + 15)}
                className="btn-secondary text-xs py-2 px-6"
              >
                Load More History
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// PlusIcon fallback since lucide may not import dynamically in some contexts
function PlusIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
