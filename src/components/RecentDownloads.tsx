import { getAllVideos } from '@/lib/FileSystemManager'
import useAsync from './hooks/useAsync'
import { Loader, VideoOff } from 'lucide-react'
import SmallVideoCard from './SmallVideoCard'

export default function RecentDownloads() {
  const { loading, value: videos } = useAsync(() => getAllVideos({ count: 5 }))

  if (loading)
    return <Loader size={25} className="animate-spin block mx-auto my-12" />

  if (!videos.length)
    return (
      <div className="flex gap-3 justify-center">
        <VideoOff />
        <p className="text-center">No Downloaded videos to show</p>
      </div>
    )

  return (
    <div className="flex flex-col gap-5">
      {videos.map((v) => (
        <SmallVideoCard
          imgSrc={v.thumbnail}
          title={v.title}
          lengthSeconds={+v.lengthSeconds}
          videoId={v.videoId}
          key={v.videoId}
        />
      ))}
    </div>
  )
}
