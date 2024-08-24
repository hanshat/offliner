import { formatSeconds } from '@/lib/utils'
import { Link } from 'react-router-dom'

type Props = {
  imgSrc: string
  title: string
  lengthSeconds: number
  videoId: string
}

export default function SmallVideoCard({
  imgSrc,
  title,
  lengthSeconds,
  videoId,
}: Props) {
  return (
    <div className="flex gap-4">
      <img
        className="h-12 w-16 rounded-sm ring-1 ring-offset-1 ring-gray-200"
        src={imgSrc}
        alt={title}
      />

      <div className="flex flex-col justify-between">
        <Link to={`/videos/${videoId}`}>
          <span className="text-primary">{title}</span>
        </Link>
        <span className="text-muted-foreground">
          {formatSeconds(lengthSeconds)}
        </span>
      </div>
    </div>
  )
}
