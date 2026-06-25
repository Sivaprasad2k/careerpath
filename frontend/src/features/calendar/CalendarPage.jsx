import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { opportunitiesApi } from '../../api/opportunitiesApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import { CalendarIcon, ClockIcon } from 'lucide-react'
import { format, formatDistanceToNow, isAfter } from 'date-fns'

export default function CalendarPage() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar-events'],
    queryFn:  opportunitiesApi.getCalendarEvents,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoadingSpinner className="text-brand-500 w-8 h-8" />
      </div>
    )
  }

  const activeEvents = events.filter(e => isAfter(new Date(e.eventDate), new Date()))
  const pastEvents = events.filter(e => !isAfter(new Date(e.eventDate), new Date()))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="border-b border-darkBorder/40 pb-6">
        <h1 className="text-2xl font-black text-white tracking-tight uppercase tracking-wider text-xs font-black text-gray-400">Calendar Schedule</h1>
        <p className="text-xs text-gray-500 font-bold mt-1">Keep track of your scheduled interviews, deadlines, and follow-ups</p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No events scheduled"
          description="Your upcoming interviews and assessment deadlines will appear here automatically."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active / Upcoming Events */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Upcoming Milestones ({activeEvents.length})</h2>
            <div className="space-y-4">
              {activeEvents.length === 0 ? (
                <p className="text-xs text-gray-500 py-10 text-center card bg-darkCard/40 border border-dashed border-darkBorder rounded-2xl">No upcoming events scheduled.</p>
              ) : (
                activeEvents.map(event => (
                  <div key={event.id} className="card bg-darkCard/95 p-5 flex items-start gap-4 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-gradient-to-b from-brand-500 to-indigo-600"></div>
                    <div className="p-3 bg-brand-500/5 text-brand-400 border border-brand-500/10 shadow-inner rounded-xl group-hover:scale-105 transition-transform duration-200">
                      <CalendarIcon size={18} />
                    </div>
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-extrabold text-white text-sm truncate">{event.title}</h4>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-brand-500/5 text-brand-400 border-brand-500/10 shrink-0">
                          {event.eventType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed font-semibold">{event.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-500 font-bold pt-2 border-t border-darkBorder/40">
                        <span className="flex items-center gap-1.5">
                          <ClockIcon size={12} />
                          {format(new Date(event.eventDate), 'PPP p')}
                        </span>
                        <span className="text-brand-400">({formatDistanceToNow(new Date(event.eventDate), { addSuffix: true })})</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Past Events History */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Completed Milestones ({pastEvents.length})</h2>
            <div className="space-y-3">
              {pastEvents.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center card bg-darkCard/40 border border-dashed border-darkBorder rounded-2xl">No past milestones.</p>
              ) : (
                pastEvents.map(event => (
                  <div key={event.id} className="card bg-darkCard/40 p-4 border border-darkBorder/60 rounded-xl space-y-2 hover:border-darkBorder transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-gray-300 text-xs line-clamp-1">{event.title}</h4>
                      <span className="text-[9px] font-extrabold tracking-wider text-gray-500 uppercase shrink-0">
                        {event.eventType.split('_')[0]}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{format(new Date(event.eventDate), 'MMM d, yyyy')}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

