import { getCategoryIcon } from '../../constants/categoryIcons.js'

const SIZES = {
  sm: { box: 'h-8 w-8 rounded-xl', icon: 15 },
  md: { box: 'h-10 w-10 rounded-2xl', icon: 18 },
  lg: { box: 'h-12 w-12 rounded-2xl', icon: 22 },
}

export default function CategoryIconBadge({ category, size = 'md', className = '' }) {
  const Icon = getCategoryIcon(category?.icon)
  const color = category?.color ?? '#64748b'
  const s = SIZES[size]
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${s.box} ${className}`}
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <Icon size={s.icon} strokeWidth={2} />
    </span>
  )
}
