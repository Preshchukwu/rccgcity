import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/format'
import { tableCellStyle, tableHeadStyle } from '@/lib/styles'
import { AlertTriangle } from 'lucide-react'

export const revalidate = 0

async function getEmergencies() {
  return prisma.emergencyReport.findMany({ orderBy: { createdAt: 'desc' } })
}

export default async function EmergenciesPage() {
  const emergencies = await getEmergencies()

  const cellStyle = { ...tableCellStyle, verticalAlign: 'top' as const }
  const thStyle = { ...tableHeadStyle, verticalAlign: 'middle' as const }

  return (
    <div style={{ padding: '28px 28px 40px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
          Emergency Reports
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
          {emergencies.length} total — read-only
        </p>
      </div>

      {emergencies.length === 0 ? (
        <div style={{
          background: 'var(--color-bg-surface)', borderRadius: 14,
          padding: 60, textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <AlertTriangle size={32} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', margin: 0 }}>
            No emergency reports yet.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--color-bg-surface)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Issue</th>
                  <th style={thStyle}>Location</th>
                  <th style={{ ...thStyle, whiteSpace: 'nowrap' }}>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {emergencies.map(e => (
                  <tr key={e.id}>
                    <td style={{ ...cellStyle, fontWeight: 'var(--font-weight-medium)', whiteSpace: 'nowrap' }}>{e.name}</td>
                    <td style={{ ...cellStyle, color: 'var(--color-danger-text)', maxWidth: 260 }}>{e.issueDescription}</td>
                    <td style={{ ...cellStyle, color: 'var(--color-text-secondary)', maxWidth: 200 }}>{e.locationDescription}</td>
                    <td style={{ ...cellStyle, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {formatDateTime(e.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
