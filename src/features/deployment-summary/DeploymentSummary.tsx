import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock'
import { HardDrivesIcon } from '@phosphor-icons/react/dist/csr/HardDrives'
import { SpinnerGapIcon } from '@phosphor-icons/react/dist/csr/SpinnerGap'
import { WarningCircleIcon } from '@phosphor-icons/react/dist/csr/WarningCircle'

import type { DeploymentSummary as Summary } from '@/domain/graph/calculateDeploymentSummary'

interface DeploymentSummaryProps {
  readonly summary: Summary
}

const metrics = [
  {
    label: 'Total devices',
    key: 'total',
    icon: HardDrivesIcon,
    tone: 'bg-slate-100 text-slate-700',
  },
  {
    label: 'Deployed',
    key: 'deployed',
    icon: CheckCircleIcon,
    tone: 'bg-emerald-100 text-emerald-700',
  },
  {
    label: 'Deploying',
    key: 'deploying',
    icon: SpinnerGapIcon,
    tone: 'bg-blue-100 text-blue-700',
  },
  {
    label: 'Pending',
    key: 'pending',
    icon: ClockIcon,
    tone: 'bg-amber-100 text-amber-700',
  },
  {
    label: 'Failed',
    key: 'failed',
    icon: WarningCircleIcon,
    tone: 'bg-rose-100 text-rose-700',
  },
] as const

export function DeploymentSummary({ summary }: DeploymentSummaryProps) {
  return (
    <section aria-labelledby="deployment-overview-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="deployment-overview-title"
            className="text-lg font-semibold tracking-tight"
          >
            Deployment status
          </h2>
          <p className="mt-1 text-sm text-mute">
            Current progress across all loaded devices.
          </p>
        </div>
        <div className="min-w-60">
          <div className="mb-1 flex justify-between text-xs font-semibold">
            <span className="text-mute">Overall progress</span>
            <span>{summary.overallProgress}%</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Overall deployment progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={summary.overallProgress}
          >
            <div
              className="h-full rounded-full bg-brand-600"
              style={{ width: `${summary.overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {metrics.map(({ label, key, icon: Icon, tone }) => {
          const value = key === 'total' ? summary.total : summary.counts[key]
          return (
            <article key={key} className="ui-card px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-mute">{label}</p>
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full ${tone}`}
                  aria-hidden="true"
                >
                  <Icon size={20} weight="duotone" />
                </span>
              </div>
              <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
                {value}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
