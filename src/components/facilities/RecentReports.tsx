import Link from 'next/link'

interface ReportPreview {
  id: string
  description: string
  type: string
  createdAt: string
  facility: { name: string }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function RecentReports({ reports }: { reports: ReportPreview[] }) {
  if (!reports.length) return null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
          Community Reports
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {reports.map(report => (
          <div key={report.id} style={{
            padding: '12px 14px',
            borderRadius: 12,
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: report.type === 'comment' ? 'var(--color-brand-text)' : 'var(--color-warning-text)',
                background: report.type === 'comment' ? 'var(--color-brand-subtle)' : 'var(--color-warning-bg)',
                padding: '1px 8px',
                borderRadius: 20,
                textTransform: 'capitalize',
              }}>
                {report.type}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                {report.facility.name}
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', margin: '0 0 4px', lineHeight: 'var(--leading-snug)' }}>
              {report.description.length > 100 ? report.description.slice(0, 100) + '…' : report.description}
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', margin: 0 }}>
              {timeAgo(report.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
