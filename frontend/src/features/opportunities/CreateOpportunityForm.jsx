import { useState } from 'react'

export default function CreateOpportunityForm({ onSubmit, loading, onCancel }) {
  const [form, setForm] = useState({
    companyName: '',
    roleName: '',
    location: '',
    source: '',
    salary: '',
    priority: 'MEDIUM',
    notes: '',
    applicationDate: ''
  })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) {
      setErrors(errs => {
        const next = { ...errs }
        delete next[e.target.name]
        return next
      })
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}

    if (!form.companyName.trim()) {
      errs.companyName = 'Company name is required'
    } else if (form.companyName.trim().length > 255) {
      errs.companyName = 'Company name must not exceed 255 characters'
    }

    if (!form.roleName.trim()) {
      errs.roleName = 'Role name is required'
    } else if (form.roleName.trim().length > 255) {
      errs.roleName = 'Role name must not exceed 255 characters'
    }

    if (form.location.trim().length > 255) {
      errs.location = 'Location must not exceed 255 characters'
    }

    if (form.source.trim().length > 1000) {
      errs.source = 'Source must not exceed 1000 characters'
    }

    if (form.salary.trim().length > 100) {
      errs.salary = 'Salary description must not exceed 100 characters'
    }

    if (form.notes.length > 5000) {
      errs.notes = 'Notes must not exceed 5000 characters'
    }

    if (form.applicationDate) {
      const selected = new Date(form.applicationDate)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      if (selected > today) {
        errs.applicationDate = 'Application date cannot be in the future'
      }
    }

    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    onSubmit({
      companyName: form.companyName.trim(),
      roleName: form.roleName.trim(),
      location: form.location.trim() || null,
      source: form.source.trim() || null,
      salary: form.salary.trim() || null,
      priority: form.priority,
      notes: form.notes.trim() || null,
      applicationDate: form.applicationDate || null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white">
      {/* Row 1: Company & Role */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Company Name *</label>
          <input
            name="companyName" value={form.companyName}
            onChange={handleChange} className="input"
            placeholder="Acme Corp" required
          />
          {errors.companyName && <p className="error-msg">{errors.companyName}</p>}
        </div>
        <div>
          <label className="label">Role Name *</label>
          <input
            name="roleName" value={form.roleName}
            onChange={handleChange} className="input"
            placeholder="Software Engineer" required
          />
          {errors.roleName && <p className="error-msg">{errors.roleName}</p>}
        </div>
      </div>

      {/* Row 2: Location & Source */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Location</label>
          <input
            name="location" value={form.location}
            onChange={handleChange} className="input"
            placeholder="US Remote / London"
          />
          {errors.location && <p className="error-msg">{errors.location}</p>}
        </div>
        <div>
          <label className="label">Source</label>
          <input
            name="source" value={form.source}
            onChange={handleChange} className="input"
            placeholder="LinkedIn / Job Board"
          />
          {errors.source && <p className="error-msg">{errors.source}</p>}
        </div>
      </div>

      {/* Row 3: Salary & Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Estimated Salary</label>
          <input
            name="salary" value={form.salary}
            onChange={handleChange} className="input"
            placeholder="e.g. $120k - $140k"
          />
          {errors.salary && <p className="error-msg">{errors.salary}</p>}
        </div>
        <div>
          <label className="label">Application Date</label>
          <input
            type="date"
            name="applicationDate" value={form.applicationDate}
            onChange={handleChange} className="input"
          />
          {errors.applicationDate && <p className="error-msg">{errors.applicationDate}</p>}
        </div>
      </div>

      {/* Row 4: Priority */}
      <div>
        <label className="label">Priority</label>
        <select
          name="priority" value={form.priority}
          onChange={handleChange} className="input font-bold"
        >
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="LOW">Low Priority</option>
        </select>
      </div>

      {/* Row 5: Notes */}
      <div>
        <label className="label">Initial Notes</label>
        <textarea
          name="notes" value={form.notes}
          onChange={handleChange} className="input resize-none font-semibold text-gray-300 bg-darkSecondary/80"
          rows={3} placeholder="Recruiter details, referral info, preparation plan..."
        />
        {errors.notes && <p className="error-msg">{errors.notes}</p>}
      </div>

      {/* Action triggers */}
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
          {loading ? 'Creating…' : 'Create Application'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
