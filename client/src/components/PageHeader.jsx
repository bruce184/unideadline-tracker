export default function PageHeader({ eyebrow, title, description, meta, actions }) {
  return (
    <header className="mb-6 rounded-2xl border border-[#e9e2fb] bg-white/95 px-5 py-4 shadow-[0_14px_40px_rgba(91,69,170,0.05)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-sm font-semibold text-[#6b5bd6]">{eyebrow}</p>
          )}
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
          {description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
          )}
          {meta && (
            <div className="mt-3 flex flex-wrap gap-2">
              {meta}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
