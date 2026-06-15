import clsx from 'clsx'

const STATUS_STYLES = {
  DRAFT:           'bg-gray-100  text-gray-700',
  APPLIED:         'bg-blue-100  text-blue-700',
  SCREENING:       'bg-yellow-100 text-yellow-700',
  TECHNICAL_ROUND: 'bg-purple-100 text-purple-700',
  HR_ROUND:        'bg-orange-100 text-orange-700',
  OFFER_RECEIVED:  'bg-green-100  text-green-700',
  REJECTED:        'bg-red-100    text-red-700',
}

const STATUS_LABELS = {
  DRAFT:           'Draft',
  APPLIED:         'Applied',
  SCREENING:       'Screening',
  TECHNICAL_ROUND: 'Technical Round',
  HR_ROUND:        'HR Round',
  OFFER_RECEIVED:  'Offer Received',
  REJECTED:        'Rejected',
}

export default function StatusBadge({ status, size = 'sm' }) {
  return (
    <span className={clsx(
      'inline-flex items-center rounded-full font-medium',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'
    )}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
