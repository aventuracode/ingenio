import Image from 'next/image'

// ============================================
// COMPONENT: AVATAR
// ============================================
// Muestra la foto del empleado o sus iniciales sobre un gradiente.

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_MAP: Record<AvatarSize, { box: string; text: string }> = {
  sm: { box: 'h-8 w-8', text: 'text-xs' },
  md: { box: 'h-10 w-10', text: 'text-sm' },
  lg: { box: 'h-12 w-12', text: 'text-base' },
  xl: { box: 'h-20 w-20', text: 'text-2xl' },
}

interface AvatarProps {
  nombre: string
  apellido: string
  src?: string | null
  size?: AvatarSize
  ring?: boolean
}

export default function Avatar({
  nombre,
  apellido,
  src,
  size = 'md',
  ring = false,
}: AvatarProps) {
  const { box, text } = SIZE_MAP[size]
  const ringClass = ring ? 'ring-2 ring-gray-100' : ''
  const alt = `${nombre} ${apellido}`
  const initials = `${nombre.charAt(0)}${apellido.charAt(0)}`

  if (src) {
    return (
      <div className={`relative ${box} flex-shrink-0 overflow-hidden rounded-full ${ringClass}`}>
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
    )
  }

  return (
    <div
      className={`flex ${box} flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 ${text} font-semibold text-white ${ringClass}`}
      aria-label={alt}
    >
      {initials}
    </div>
  )
}
