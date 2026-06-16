import { useState } from 'react'
import toast from 'react-hot-toast'

export default function InterviewForm({
  onSubmit,
  onCancel,
  initialValues = {},
  isSubmitting = false,
  submitLabel = 'Confirm Stage Move',
  hideCancel = false
}) {
  const getInitialDateTimeString = (val) => {
    if (!val) return ''
    try {
      const d = new Date(val)
      if (isNaN(d.getTime())) return ''
      const pad = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    } catch (e) {
      return ''
    }
  }

  const [form, setForm] = useState({
    roundType: initialValues.roundType || 'Screening',
    scheduledAt: getInitialDateTimeString(initialValues.scheduledAt),
    interviewerName: initialValues.interviewerName || '',
    platform: initialValues.platform || '',
    durationMinutes: initialValues.durationMinutes || 60,
    notes: initialValues.notes || '',
    outcome: initialValues.outcome || ''
  })

  function handleSubmit(e) {
    e.preventDefault()

    if (!form.roundType) {
      toast.error('Round Type is required')
      return
    }
    if (!form.scheduledAt) {
      toast.error('Scheduled Date & Time is required')
      return
    }
    const selectedDate = new Date(form.scheduledAt)
    if (isNaN(selectedDate.getTime())) {
      toast.error('Invalid scheduled date & time')
      return
    }
    if (!form.platform.trim()) {
      toast.error('Meeting Link / Platform is required')
      return
    }
    if (form.notes && form.notes.length > 2000) {
      toast.error('Preparation Notes must not exceed 2000 characters')
      return
    }
    if (form.outcome && form.outcome.length > 1000) {
      toast.error('Outcome must not exceed 1000 characters')
      return
    }

    const payload = {
      roundType: form.roundType,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      interviewerName: form.interviewerName.trim() || null,
      platform: form.platform.trim(),
      durationMinutes: parseInt(form.durationMinutes) || null,
      notes: form.notes.trim() || null,
      outcome: form.outcome.trim() || null
    }

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Round Type */}
        <div className="flex flex-col gap-1">
          <label className="label">ROUND TYPE *</label>
          <select
            value={form.roundType}
            onChange={(e) => setForm((p) => ({ ...p, roundType: e.target.value }))}
            className="input bg-darkSecondary text-xs font-bold"
            required
          >
            <option value="Screening">Screening</option>
            <option value="Technical">Technical</option>
            <option value="System Design">System Design</option>
            <option value="HR">HR</option>
            <option value="Managerial">Managerial</option>
          </select>
        </div>

        {/* Meeting Link / Platform */}
        <div className="flex flex-col gap-1">
          <label className="label">MEETING LINK / PLATFORM *</label>
          <input
            type="text"
            value={form.platform}
            onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}
            className="input text-xs"
            placeholder="Zoom, Google Meet, MS Teams, etc."
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scheduled Date & Time */}
        <div className="flex flex-col gap-1">
          <label className="label">SCHEDULED DATE & TIME *</label>
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
            className="input text-xs"
            required
          />
        </div>

        {/* Interviewer Name */}
        <div className="flex flex-col gap-1">
          <label className="label">INTERVIEWER NAME</label>
          <input
            type="text"
            value={form.interviewerName}
            onChange={(e) => setForm((p) => ({ ...p, interviewerName: e.target.value }))}
            className="input text-xs"
            placeholder="e.g. Jane Doe"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Duration (Minutes) */}
        <div className="flex flex-col gap-1">
          <label className="label">DURATION (MINUTES)</label>
          <input
            type="number"
            value={form.durationMinutes}
            onChange={(e) => setForm((p) => ({ ...p, durationMinutes: e.target.value }))}
            className="input text-xs"
            placeholder="60"
            min="1"
          />
        </div>

        {/* Outcome (Optional) */}
        <div className="flex flex-col gap-1">
          <label className="label">OUTCOME (OPTIONAL)</label>
          <input
            type="text"
            value={form.outcome}
            onChange={(e) => setForm((p) => ({ ...p, outcome: e.target.value }))}
            className="input text-xs"
            placeholder="Passed, Pending, etc."
          />
        </div>
      </div>

      {/* Preparation Notes */}
      <div className="flex flex-col gap-1">
        <label className="label">PREPARATION NOTES</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          className="input resize-none text-xs"
          rows={3}
          placeholder="Focus areas, topics to review, coding questions..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary flex-1 justify-center py-2.5 font-bold"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        {!hideCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary py-2.5 font-bold"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
