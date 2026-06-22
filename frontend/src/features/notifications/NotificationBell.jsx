import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BellIcon } from 'lucide-react'
import { notificationsApi } from '../../api/notificationsApi'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationBell() {
  const [open, setOpen]   = useState(false)
  const queryClient       = useQueryClient()

  const { data: count = 0 } = useQuery({
    queryKey: ['notifications-count'],
    queryFn:  notificationsApi.unreadCount,
    refetchInterval: 30000,  // poll every 30s
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications-list'],
    queryFn:  () => notificationsApi.list({ page: 0, size: 10 }).then(d => d.content ?? []),
    enabled:  open,
  })

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-full'] })
    },
  })

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <BellIcon size={18} />
        {count > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center
            w-3.5 h-3.5 rounded-full bg-brand-600 text-white text-[9px] font-black leading-none shadow shadow-brand-500/50">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2.5 z-40 w-[calc(100vw-2rem)] sm:w-80 card bg-darkCard border border-darkBorder shadow-2xl overflow-hidden rounded-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-darkBorder/40 bg-darkSecondary/40">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Notifications</h3>
              {count > 0 && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  className="text-[10px] font-black uppercase text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto divide-y divide-darkBorder/40">
              {notifications.length === 0 ? (
                <li className="px-4 py-8 text-center text-xs text-gray-500 font-bold uppercase">All caught up!</li>
              ) : (
                notifications.map((n) => (
                  <li key={n.id} className={`px-4 py-3 text-xs leading-relaxed transition-all relative ${n.read ? 'bg-darkCard/30' : 'bg-brand-500/5'}`}>
                    {!n.read && (
                      <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-brand-500"></div>
                    )}
                    <p className="font-extrabold text-white">{n.title}</p>
                    <p className="text-gray-400 font-semibold text-[11px] mt-0.5">{n.message}</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase mt-1.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

