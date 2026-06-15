import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, BriefcaseIcon, SearchIcon, FilterIcon } from 'lucide-react'
import { opportunitiesApi } from '../../api/opportunitiesApi'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import CreateOpportunityForm from './CreateOpportunityForm'
import ApplicationDetailPanel from './ApplicationDetailPanel'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

export default function OpportunityListPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [selectedOppId, setSelectedOppId] = useState(id || null)
  
  const queryClient = useQueryClient()

  useEffect(() => {
    if (id) {
      setSelectedOppId(id)
    } else {
      setSelectedOppId(null)
    }
  }, [id])

  function handleCloseDrawer() {
    setSelectedOppId(null)
    navigate('/opportunities')
  }

  const { data, isLoading } = useQuery({
    queryKey: ['opportunities-list'],
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

  const opportunities = data?.content ?? []

  const filteredOpps = opportunities.filter(opp => {
    const matchesSearch = opp.companyName.toLowerCase().includes(search.toLowerCase()) || 
                          opp.roleName.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = priorityFilter === 'ALL' || opp.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-darkBorder/40 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase tracking-wider text-xs font-black text-gray-400">Applications List</h1>
          <p className="text-xs text-gray-500 font-bold mt-1">Currently tracking {opportunities.length} applications</p>
        </div>
        <div>
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            <PlusIcon size={15} /> Add Application
          </button>
        </div>
      </div>

      {/* Search and Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <SearchIcon size={14} />
          </div>
          <input
            type="text"
            placeholder="Search company or role name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input text-xs font-bold w-40"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner className="text-brand-500 w-8 h-8" /></div>
      ) : filteredOpps.length === 0 ? (
        <EmptyState
          icon={BriefcaseIcon}
          title={search || priorityFilter !== 'ALL' ? "No matching applications" : "No applications yet"}
          description={search || priorityFilter !== 'ALL' ? "Try adjusting your search query or filters." : "Track all your interviews and offers in one place. Add your first application to start."}
          action={
            <button className="btn-primary" onClick={() => setCreateOpen(true)}>
              <PlusIcon size={15} /> Add Application
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden border border-darkBorder bg-darkCard/30 shadow-2xl">
          <table className="w-full text-sm text-left text-gray-300">
            <thead>
              <tr className="border-b border-darkBorder/60 bg-darkSecondary/40 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-5 py-4 font-black">Company</th>
                <th className="px-5 py-4 font-black">Role</th>
                <th className="px-5 py-4 font-black">Priority</th>
                <th className="px-5 py-4 font-black">Status</th>
                <th className="px-5 py-4 font-black text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-darkBorder/40">
              {filteredOpps.map((opp) => (
                <tr
                  key={opp.id}
                  onClick={() => navigate('/opportunities/' + opp.id)}
                  className="hover:bg-darkCard/60 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-3.5 font-extrabold text-white group-hover:text-brand-400 transition-colors">
                    {opp.companyName}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 font-semibold">{opp.roleName}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      opp.priority === 'HIGH' ? 'bg-red-950/20 text-red-400 border-red-900/30' : opp.priority === 'MEDIUM' ? 'bg-yellow-950/20 text-yellow-400 border-yellow-900/30' : 'bg-blue-950/20 text-blue-400 border-blue-900/30'
                    }`}>
                      {opp.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={opp.currentStatus} /></td>
                  <td className="px-5 py-3.5 text-gray-500 font-bold text-xs text-right">
                    {formatDistanceToNow(new Date(opp.updatedAt), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Slide Drawer Panel Detail View ────────────────────────────── */}
      <AnimatePresence>
        {selectedOppId && (
          <ApplicationDetailPanel
            id={selectedOppId}
            onClose={handleCloseDrawer}
          />
        )}
      </AnimatePresence>

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

