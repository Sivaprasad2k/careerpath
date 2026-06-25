import clsx from 'clsx'

const STATUS_STYLES = {
  DRAFT:                'bg-slate-950/40 text-slate-400 border border-slate-900/40',
  APPLIED:              'bg-blue-950/40 text-blue-400 border border-blue-900/40',
  SCREENING:            'bg-yellow-950/40 text-yellow-400 border border-yellow-900/40',
  TECHNICAL_ROUND:      'bg-purple-950/40 text-purple-400 border border-purple-900/40',
  HR_ROUND:             'bg-amber-950/40 text-amber-400 border border-amber-900/40',
  ASSESSMENT_RECEIVED:  'bg-fuchsia-950/40 text-fuchsia-400 border border-fuchsia-900/40',
  ASSESSMENT_COMPLETED: 'bg-purple-950/40 text-purple-300 border border-purple-900/40',
  INTERVIEW_SCHEDULED:  'bg-violet-950/40 text-violet-400 border border-violet-900/40',
  INTERVIEW_COMPLETED:  'bg-indigo-950/40 text-indigo-300 border border-indigo-900/40',
  OFFER_RECEIVED:       'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40',
  ACCEPTED:             'bg-green-950/40 text-green-300 border border-green-900/40',
  REJECTED:             'bg-red-950/40 text-red-400 border border-red-900/40',
  DECLINED:             'bg-zinc-950/40 text-zinc-400 border border-zinc-900/40',
  WITHDRAWN:             'bg-neutral-950/40 text-neutral-400 border border-neutral-900/40',
}

const STATUS_LABELS = {
  DRAFT:                'Draft',
  APPLIED:              'Applied',
  SCREENING:            'Screening',
  TECHNICAL_ROUND:      'Technical Round',
  HR_ROUND:             'HR Round',
  ASSESSMENT_RECEIVED:  'Assessment Invited',
  ASSESSMENT_COMPLETED: 'Assessment Completed',
  INTERVIEW_SCHEDULED:  'Interview Scheduled',
  INTERVIEW_COMPLETED:  'Interview Completed',
  OFFER_RECEIVED:       'Offer Received',
  ACCEPTED:             'Accepted',
  REJECTED:             'Rejected',
  DECLINED:             'Declined',
  WITHDRAWN:             'Withdrawn',
}

export default function StatusBadge({ status, size = 'sm' }) {
  return (
    <span className={clsx(
      'inline-flex items-center rounded-full font-bold uppercase tracking-wider',
      size === 'sm' ? 'px-2.5 py-0.5 text-[9px]' : 'px-3.5 py-1 text-[10px]',
      STATUS_STYLES[status] ?? 'bg-slate-950/40 text-slate-400 border border-slate-900/40'
    )}>
      {STATUS_LABELS[status] ?? status.replace(/_/g, ' ')}
    </span>
  )
}
