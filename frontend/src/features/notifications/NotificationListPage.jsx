import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BellIcon } from 'lucide-react'
import { notificationsApi } from '../../api/notificationsApi'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function NotificationListPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-full'],
    queryFn:  () => notificationsApi.list({ page: 0, size: 50 }),
  })

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-full'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
      toast.success('All marked as read')
    },
  })

  const notifications = data?.content ?? []
  const unread = notifications.filter(n => !n.read)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-darkBorder/40 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase tracking-wider text-xs font-black text-gray-400">Notifications</h1>
          <p className="text-xs text-gray-500 font-bold mt-1">
            {unread.length > 0 ? `${unread.length} unread updates` : 'All caught up'}
          </p>
        </div>
        <div>
          {unread.length > 0 && (
            <button className="btn-secondary text-xs" onClick={() => markAllMutation.mutate()}>
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner className="text-brand-500 w-8 h-8" /></div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={BellIcon} title="No notifications"
          description="Notifications will appear here as your applications progress." />
      ) : (
        <div className="card divide-y divide-darkBorder/40 bg-darkCard border border-darkBorder overflow-hidden shadow-2xl">
          {notifications.map((n) => (
            <div key={n.id} className={`px-6 py-4 transition-colors relative ${n.read ? 'bg-darkCard/40' : 'bg-brand-500/5'}`}>
              {!n.read && (
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-brand-500"></div>
              )}
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-extrabold text-white">{n.title}</p>
                {!n.read && (
                  <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-brand-500 shadow-md shadow-brand-500/50 mt-1" />
                )}
              </div>
              <p className="text-xs text-gray-400 font-semibold mt-1 leading-relaxed">{n.message}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-2.5">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

