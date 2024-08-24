import { formatSeconds } from '@/lib/utils'
import { Button } from './ui/button'
import clsx from 'clsx'
import { CirclePlay } from 'lucide-react'

type Props = {
  imgSrc: string
  title: string
  duration: number
  onClick: () => void
  selected?: boolean
}

export default function AudioCard({
  imgSrc,
  title,
  duration,
  selected,
  onClick,
}: Props) {
  return (
    <div
      className={clsx('flex gap-2', {
        'bg-secondary text-secondary-foreground rounded p-2': selected,
      })}
    >
      <Button
        variant="ghost"
        onClick={onClick}
        className="w-16 h-12 p-0 relative group shrink-0"
      >
        <CirclePlay />
        <img
          src={imgSrc}
          alt={title}
          className="object-cover w-full h-full rounded-sm"
        />
      </Button>

      <div className="flex flex-col">
        <Button
          className="line-clamp-1 p-0 h-auto"
          variant="link"
          onClick={onClick}
        >
          {title}
        </Button>
        <p>{formatSeconds(duration)}</p>
      </div>
    </div>
  )
}
