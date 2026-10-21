import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'mute';

const toneIcon: Record<Tone, IconName> = {
  ok: 'check',
  warn: 'alert',
  bad: 'alert',
  info: 'info',
  mute: 'clock',
};

export function Badge({
  tone,
  children,
  icon,
  dot,
}: {
  tone: Tone;
  children: ReactNode;
  icon?: IconName;
  dot?: boolean;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot ? <span className="badge-dot" aria-hidden="true" /> : <Icon name={icon ?? toneIcon[tone]} size={13} />}
      <span>{children}</span>
    </span>
  );
}
