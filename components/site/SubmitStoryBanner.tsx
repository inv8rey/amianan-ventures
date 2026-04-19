import { ArrowRight, FileText } from 'lucide-react'

export function SubmitStoryBanner() {
  return (
    <div className="mt-12 rounded-xl border-2 border-black overflow-hidden">
      <div className="bg-[#00cc6a] px-6 py-3 flex items-center gap-2">
        <FileText className="h-4 w-4 text-black" />
        <span className="text-sm font-black text-black uppercase tracking-wider">Share Your Story</span>
      </div>
      <div className="bg-white p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
        <div>
          <h3 className="text-lg font-black text-zinc-900 mb-1 leading-tight">
            Are you a founder, innovator, or community builder in Northern Luzon?
          </h3>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-xl">
            We're always looking for compelling stories from the region's ecosystem. Whether you're launching a startup, running a program, or doing something interesting — we'd love to feature you.
          </p>
        </div>
        <a
          href="https://airtable.com/appYUrRsmwImGgG3C/pagjZcduZUZQd759K/form"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded font-bold text-sm hover:bg-zinc-800 transition-colors uppercase tracking-wide"
        >
          Submit a story <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
