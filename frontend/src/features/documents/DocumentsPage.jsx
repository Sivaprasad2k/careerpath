import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { opportunitiesApi } from '../../api/opportunitiesApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { FileTextIcon, DownloadIcon, FolderIcon, SearchIcon } from 'lucide-react'

export default function DocumentsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')

  // 1. Fetch opportunities
  const { data: opportunitiesData, isLoading: oppsLoading } = useQuery({
    queryKey: ['opportunities-all'],
    queryFn: () => opportunitiesApi.list({ page: 0, size: 200 }),
  })

  const opps = opportunitiesData?.content ?? []

  // 2. Fetch documents for each opportunity using Promise.all in a query
  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['global-documents', opps.map(o => o.id).join(',')],
    queryFn: async () => {
      if (opps.length === 0) return []
      const results = await Promise.all(
        opps.map(async (o) => {
          try {
            const docs = await opportunitiesApi.getDocuments(o.id)
            return docs.map(d => ({ ...d, opportunity: o }))
          } catch (e) {
            return []
          }
        })
      )
      return results.flat()
    },
    enabled: opps.length > 0,
  })

  if (oppsLoading || docsLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoadingSpinner className="text-brand-500 w-8 h-8" />
      </div>
    )
  }

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(search.toLowerCase()) ||
                          doc.opportunity.companyName.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'ALL' || doc.fileType === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="border-b border-darkBorder/40 pb-6">
        <h1 className="text-2xl font-black text-white tracking-tight uppercase tracking-wider text-xs font-black text-gray-400">Global Documents Vault</h1>
        <p className="text-xs text-gray-500 font-bold mt-1">Review and manage all resumes, cover letters, and portfolios attached to your applications</p>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <SearchIcon size={14} />
          </div>
          <input
            type="text"
            placeholder="Search document name or company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input text-xs font-bold w-full sm:w-40"
          >
            <option value="ALL">All Types</option>
            <option value="RESUME">Resumes</option>
            <option value="COVER_LETTER">Cover Letters</option>
            <option value="PORTFOLIO">Portfolios</option>
            <option value="CERTIFICATE">Certificates</option>
            <option value="OTHER">Others</option>
          </select>
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={FolderIcon}
          title={search || typeFilter !== 'ALL' ? "No matching documents" : "No documents uploaded"}
          description={search || typeFilter !== 'ALL' ? "Try adjusting your search criteria or type filters." : "Attach resumes or cover letters directly in each application drawer to track them centrally."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="card bg-darkCard/80 border border-darkBorder/60 p-5 hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-[1px] transition-all duration-300 flex flex-col justify-between group rounded-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-500/5 text-brand-400 border border-brand-500/10 shadow-inner rounded-xl group-hover:scale-105 transition-transform duration-200 shrink-0">
                  <FileTextIcon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-white text-sm truncate" title={doc.fileName}>{doc.fileName}</h4>
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-wider mt-0.5">{doc.fileType.replace(/_/g, ' ')}</p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
                    <span className="truncate">For: <strong className="text-white">{doc.opportunity.companyName}</strong></span>
                  </div>
                </div>
              </div>

              <div className="border-t border-darkBorder/40 mt-4.5 pt-3.5 flex justify-between items-center">
                <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Linked Application</span>
                <a
                  href={opportunitiesApi.downloadDocumentUrl(doc.id)}
                  download
                  className="btn-secondary text-[9px] py-1.5 px-3 flex items-center gap-1.5 shadow-md"
                >
                  <DownloadIcon size={11} /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
