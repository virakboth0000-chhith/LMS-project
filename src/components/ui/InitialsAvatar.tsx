import React from 'react';

interface InitialsAvatarProps {
  name?: string;
  className?: string;
}

const COLORS = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-purple-500',
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function InitialsAvatar({ name = '?', className = 'w-9 h-9' }: InitialsAvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || '?';

  return (
    <div
      className={`${className} ${colorFor(name)} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      aria-label={`${name} avatar`}
    >
      <span style={{ fontSize: '0.85em' }}>{initials}</span>
    </div>
  );
}
