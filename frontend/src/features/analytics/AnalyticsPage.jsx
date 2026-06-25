import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { opportunitiesApi } from '../../api/opportunitiesApi'
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import {
  BarChart3Icon, TrendingUpIcon, AwardIcon, PercentIcon,
  HelpCircleIcon, SparklesIcon, ArchiveIcon, InboxIcon
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

// Custom tooltip styling for premium dark theme
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#161C31] border border-white/10 p-3 rounded-xl shadow-2xl shadow-black/80 backdrop-blur-md">
        {label && <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">{label}</p>}
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.payload.color }} />
            <span>{item.name}:</span>
            <span className="font-black text-brand-400">{item.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const { data: opportunitiesData, isLoading } = useQuery({
    queryKey: ['opportunities-all'],
    queryFn: () => opportunitiesApi.list({ page: 0, size: 200 }),
  })

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="border-b border-darkBorder/40 pb-6 animate-pulse">
          <div className="h-6 bg-darkCard/50 rounded w-1/4" />
          <div className="h-3 bg-darkCard/50 rounded w-1/3 mt-2" />
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="card bg-darkCard/40 border border-darkBorder/80 p-5 animate-pulse flex justify-between items-center">
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-darkSecondary/80 rounded w-1/2" />
                <div className="h-6 bg-darkSecondary/80 rounded w-1/3" />
              </div>
              <div className="w-10 h-10 bg-darkSecondary/80 rounded-xl" />
            </div>
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card bg-darkCard/40 border border-darkBorder/80 p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-darkSecondary/80 rounded w-1/4" />
            <div className="h-60 bg-darkSecondary/40 rounded" />
          </div>
          <div className="card bg-darkCard/40 border border-darkBorder/80 p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-darkSecondary/80 rounded w-1/3" />
            <div className="h-60 bg-darkSecondary/40 rounded" />
          </div>
        </div>
      </div>
    )
  }

  const opps = opportunitiesData?.content ?? []
  const totalCount = opps.length

  // 2. Empty State Placeholder
  if (totalCount === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center py-20 space-y-6"
      >
        <div className="w-20 h-20 bg-darkCard border border-darkBorder/80 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
          <BarChart3Icon size={36} className="text-gray-500 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-black text-white tracking-tight">No Analytics Insights Yet</h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto font-medium">
            Once you add and submit application paths to your pipeline, live conversion rates, stage metrics, and priority tracks will update in real time.
          </p>
        </div>
      </motion.div>
    )
  }

  // Stats Breakdown
  const applied = opps.filter(o => o.currentStatus === 'APPLIED').length
  const assessment = opps.filter(o => ['ASSESSMENT_RECEIVED', 'ASSESSMENT_COMPLETED'].includes(o.currentStatus)).length
  const interview = opps.filter(o => ['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'].includes(o.currentStatus)).length
  const offer = opps.filter(o => ['OFFER_RECEIVED', 'ACCEPTED'].includes(o.currentStatus)).length
  const rejected = opps.filter(o => ['REJECTED', 'DECLINED', 'WITHDRAWN'].includes(o.currentStatus)).length

  // Ratios
  const interviewRate = totalCount ? Math.round(((interview + offer) / totalCount) * 100) : 0
  const offerSuccessRate = (interview + offer) ? Math.round((offer / (interview + offer)) * 100) : 0

  // Line Chart Data: Applications added over time (Grouped by application date or createdAt)
  const dateMap = {}
  opps.forEach(o => {
    // Fallback to createdAt if applicationDate is null
    const dateStr = o.applicationDate || (o.createdAt ? o.createdAt.split('T')[0] : null)
    if (dateStr) {
      dateMap[dateStr] = (dateMap[dateStr] || 0) + 1
    }
  })

  // Sort dates chronologically and map to chart values
  const sortedDates = Object.keys(dateMap).sort()
  let cumulativeSum = 0
  const lineChartData = sortedDates.map(date => {
    cumulativeSum += dateMap[date]
    let formattedDate = date
    try {
      formattedDate = format(parseISO(date), 'MMM d')
    } catch (e) {
      // safe fallback
    }
    return {
      date: formattedDate,
      Submissions: dateMap[date],
      Cumulative: cumulativeSum
    }
  })

  // Fallback if no dates were parsed
  if (lineChartData.length === 0) {
    lineChartData.push({ date: 'No Data', Submissions: 0, Cumulative: 0 })
  }

  // Pie Chart Data: Status Distribution (Doughnut with innerRadius)
  const statusPieData = [
    { name: 'Applied', value: applied + opps.filter(o => o.currentStatus === 'DRAFT').length, color: '#6366f1' },
    { name: 'Assessment', value: assessment, color: '#a855f7' },
    { name: 'Interview', value: interview, color: '#ec4899' },
    { name: 'Offer', value: offer, color: '#10b981' },
    { name: 'Inactive/Rejected', value: rejected, color: '#ef4444' }
  ].filter(d => d.value > 0) // only render active slices

  // Priority Distribution Bar Chart Data
  const highPriority = opps.filter(o => o.priority === 'HIGH').length
  const medPriority = opps.filter(o => o.priority === 'MEDIUM').length
  const lowPriority = opps.filter(o => o.priority === 'LOW').length
  const priorityBarData = [
    { name: 'High', Count: highPriority, color: '#ef4444' },
    { name: 'Medium', Count: medPriority, color: '#eab308' },
    { name: 'Low', Count: lowPriority, color: '#3b82f6' }
  ]

  // Conversion Funnel Data (Steps representing pipeline transition rates)
  const funnelStagesData = [
    { name: 'Total Tracked', shortName: 'Tracked', Count: totalCount, rate: 100, color: '#6366f1' },
    { name: 'Assessments Invite', shortName: 'Assessments', Count: assessment + interview + offer, rate: totalCount ? Math.round(((assessment + interview + offer) / totalCount) * 100) : 0, color: '#a855f7' },
    { name: 'Interview Invites', shortName: 'Interviews', Count: interview + offer, rate: totalCount ? Math.round(((interview + offer) / totalCount) * 100) : 0, color: '#ec4899' },
    { name: 'Offers Secured', shortName: 'Offers', Count: offer, rate: totalCount ? Math.round((offer / totalCount) * 100) : 0, color: '#10b981' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      <div className="border-b border-darkBorder/40 pb-6">
        <h1 className="text-2xl font-black text-white tracking-tight uppercase tracking-wider text-xs font-black text-gray-400">Analytics Insights</h1>
        <p className="text-xs text-gray-500 font-bold mt-1">Real-time statistics, funnel conversions, and success ratios for your career journey</p>
      </div>

      {/* Numerical Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-darkCard/60 p-5 flex items-center justify-between border border-darkBorder/80">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Tracked</span>
            <div className="text-2xl font-black text-white">{totalCount}</div>
          </div>
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
            <BarChart3Icon size={18} />
          </div>
        </div>

        <div className="card bg-darkCard/60 p-5 flex items-center justify-between border border-darkBorder/80">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Interview Rate</span>
            <div className="text-2xl font-black text-violet-400">{interviewRate}%</div>
          </div>
          <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
            <TrendingUpIcon size={18} />
          </div>
        </div>

        <div className="card bg-darkCard/60 p-5 flex items-center justify-between border border-darkBorder/80">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Offer Conversion</span>
            <div className="text-2xl font-black text-emerald-400">{offerSuccessRate}%</div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <AwardIcon size={18} />
          </div>
        </div>

        <div className="card bg-darkCard/60 p-5 flex items-center justify-between border border-darkBorder/80">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Offers Received</span>
            <div className="text-2xl font-black text-blue-400">{offer}</div>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <PercentIcon size={18} />
          </div>
        </div>
      </div>

      {/* Row 1: LineChart & PieChart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sleek Line Chart */}
        <div className="lg:col-span-2 card bg-darkCard/80 border border-darkBorder p-6 flex flex-col justify-between rounded-2xl shadow-xl shadow-black/25">
          <div className="mb-4">
            <h3 className="font-extrabold text-white text-sm">Application Activity Trends</h3>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">Chronological progress of application submissions over time</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 9, color: '#94A3B8', paddingTop: 10, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }} />
                <Line
                  type="monotone"
                  dataKey="Submissions"
                  name="Daily Submissions"
                  stroke="#ec4899"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: '#12172A', strokeWidth: 1.5, fill: '#ec4899' }}
                  activeDot={{ r: 6, stroke: '#ec4899', strokeWidth: 2, fill: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="Cumulative"
                  name="Cumulative Growth"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: '#12172A', strokeWidth: 1.5, fill: '#6366f1' }}
                  activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="card bg-darkCard/80 border border-darkBorder p-6 flex flex-col justify-between rounded-2xl shadow-xl shadow-black/25">
          <div className="mb-4">
            <h3 className="font-extrabold text-white text-sm">Status Distribution</h3>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">Doughnut breakdown of active/inactive states</p>
          </div>
          <div className="h-56 w-full flex justify-center items-center relative">
            {statusPieData.length === 0 ? (
              <span className="text-xs text-gray-500">No active applications</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<ChartTooltip />} />
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs font-black text-white">Pipeline</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Stages</span>
            </div>
          </div>
          <div className="mt-2 space-y-1.5 max-h-24 overflow-y-auto pr-1">
            {statusPieData.map((d, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="uppercase tracking-wider text-[9px] text-gray-500 font-black">{d.name}</span>
                </div>
                <span className="text-white font-black">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: BarChart Priority & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Priority Tracks BarChart */}
        <div className="card bg-darkCard/80 border border-darkBorder p-6 flex flex-col justify-between rounded-2xl shadow-xl shadow-black/25">
          <div className="mb-4">
            <h3 className="font-extrabold text-white text-sm">Priority Focus Tracks</h3>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">Volume breakdown matching priority weightings</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Count" radius={[4, 4, 0, 0]}>
                  {priorityBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Horizontal Funnel Bar Chart */}
        <div className="lg:col-span-2 card bg-darkCard/80 border border-darkBorder p-6 flex flex-col justify-between rounded-2xl shadow-xl shadow-black/25">
          <div className="mb-4">
            <h3 className="font-extrabold text-white text-sm">Conversion Funnel</h3>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">Progression flow from application to final offer</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={funnelStagesData}
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.02)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} />
                <YAxis dataKey="shortName" type="category" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} width={65} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Count" name="Applications count" radius={[0, 4, 4, 0]}>
                  {funnelStagesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-gray-500">
            {funnelStagesData.map((stage, i) => (
              <div key={i} className="border-r border-darkBorder/30 last:border-0 px-1">
                <p className="text-white font-black text-xs">{stage.rate}%</p>
                <p className="mt-0.5 hidden sm:block truncate uppercase tracking-wider text-[8px] text-gray-500 font-bold">{stage.name}</p>
                <p className="mt-0.5 block sm:hidden truncate uppercase tracking-wider text-[8px] text-gray-500 font-bold">{stage.shortName}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
