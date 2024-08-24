import { Eye, GanttChart, Loader, RefreshCcw, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { removeVideo } from '@/lib/FileSystemManager'
import { formatNumber, formatSeconds, humanFileSize } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useRef, useState } from 'react'
import { toast } from './ui/use-toast'
import { set } from '@/lib/videoStore'
import { PopoverClose } from '@radix-ui/react-popover'
import { Video } from '@/lib/api'

type Props = {
  videoInfo: Video
  onDelete?: (videoId: string) => void
  onClick?: (videoId: string) => void
}
export default function VideoCard({ videoInfo, onDelete, onClick }: Props) {
  const closeBtn = useRef<HTMLButtonElement>()
  const [fetching, setFetching] = useState(false)
  const [video, setVideo] = useState<Video>(videoInfo)
  const videoLink = onClick ? undefined : `/videos/${video.videoId}`

  const refreshVideo = async () => {
    setFetching(true)

    try {
      const response = await fetch(`/api/video/info?url=${video.videoId}`)
      const videoDetails = await response.json()

      if (response.ok) {
        const { file, type, downloadedAt } = videoInfo
        const updated = { ...videoDetails, file, type, downloadedAt }

        setVideo(updated)
        await set(videoInfo.videoId, updated)
        toast({ title: 'Video refreshed!' })
        closeBtn.current.click()
      } else {
        toast({ title: videoDetails.error.toString() })
      }
    } catch (error) {
      toast({ title: (error as Error).message })
    } finally {
      setFetching(false)
    }
  }

  return (
    <div className="space-y-2 relative group">
      <Link
        className="font-medium"
        to={videoLink}
        onClick={() => onClick?.(video.videoId)}
      >
        <div className="relative w-full">
          <img
            alt="Video thumbnail"
            className="aspect-video overflow-hidden rounded-lg object-cover w-full border border-primary"
            height={225}
            src={video.thumbnail}
            width={400}
          />
          <p className="absolute bottom-2 left-2 bg-[#00000099] text-white rounded p-1 leading-none text-sm">
            {humanFileSize(video.file.size)}
          </p>
          <p className="absolute bottom-2 right-2 bg-[#00000099] text-white rounded p-1 leading-none text-sm">
            {formatSeconds(+video.lengthSeconds)}
          </p>
        </div>
        <span className="sr-only">Watch video</span>
      </Link>
      <h3 className="flex items-center">
        <Link
          className="hover:underline text-base leading-none flex-grow mr-1 text-primary line-clamp-2"
          to={videoLink}
        >
          {video.title}
        </Link>

        <p className="text-sm text-muted-foreground w-12">
          {formatNumber(+video.viewCount)}
        </p>
        <Eye size={22} className="flex-shrink-0 text-muted-foreground" />
      </h3>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute text-white !mt-0 top-1 right-1 "
          >
            <GanttChart />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-64 flex flex-col gap-2 right-0"
        >
          <Button
            variant="secondary"
            className="flex gap-2"
            onClick={refreshVideo}
          >
            {fetching ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <RefreshCcw size={18} />
            )}
            Refresh
          </Button>
          {onDelete && (
            <Button
              onClick={async () => {
                const id = video.videoId || video.file.name
                await removeVideo(id)
                onDelete(id)
              }}
              variant="destructive"
              className="flex gap-2"
            >
              <Trash2 size={18} />
              Delete
            </Button>
          )}
          <PopoverClose asChild>
            <button hidden ref={closeBtn}>
              close
            </button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
    </div>
  )
}
