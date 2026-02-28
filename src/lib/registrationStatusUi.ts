import type { RegistrationStatus } from '@/types/registrationManager'

const STATUS_BADGE_CLASS_MAP: Record<RegistrationStatus, string> = {
  ACCEPTED: 'border-primary/35 bg-primary/16 text-primary',
  DECLINED: 'border-destructive/35 bg-destructive/16 text-destructive',
  PENDING: 'border-accent/35 bg-accent/24 text-accent-foreground',
  PROCESSING: 'border-secondary/45 bg-secondary text-secondary-foreground',
  ACTION_REQUIRED: 'border-destructive/35 bg-destructive/22 text-destructive',
  DELETED: 'border-border/70 bg-muted/70 text-muted-foreground',
}

const DEFAULT_STATUS_BADGE_CLASS = 'border-border/70 bg-muted/70 text-muted-foreground'

export function getRegistrationStatusBadgeClasses(status?: string | null): string {
  if (!status) {
    return DEFAULT_STATUS_BADGE_CLASS
  }
  return STATUS_BADGE_CLASS_MAP[status as RegistrationStatus] ?? DEFAULT_STATUS_BADGE_CLASS
}
