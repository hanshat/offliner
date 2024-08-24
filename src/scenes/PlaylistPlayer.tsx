import AuthorCard from '@/components/AuthorCard'
import VideoCard from '@/components/VideoCard'
import useAsync from '@/components/hooks/useAsync'
import { Video } from '@/lib/api'
import { getPlaylist, updatePlaylist } from '@/lib/playlist'
import { formatNumber } from '@/lib/utils'
import { Loader } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function PlaylistPlayer() {
  const { id } = useParams()
  const { loading, value: playlist } = useAsync(() => getPlaylist(id))
  const [currentVideo, setCurrentVideo] = useState<Video>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideoSrc, setCurrentVideoSrc] = useState(null)

  useEffect(() => {
    if (!playlist) return

    document.title = playlist.name + ' | Playlists'

    let current: Video

    if (playlist.lastPlayedId) {
      current = playlist.videos.find((v) => v.videoId === playlist.lastPlayedId)
    } else current = playlist.videos[0]

    setCurrentVideo(current)
  }, [playlist])

  useEffect(() => {
    if (!currentVideo) return

    const currentVideoIndex = playlist.videos.findIndex(
      (v) => v.videoId === currentVideo.videoId
    )

    const previousVideos = playlist.videos.slice(0, currentVideoIndex)
    const nextVideos = playlist.videos.slice(currentVideoIndex + 1)

    setVideos(nextVideos.concat(previousVideos))
  }, [currentVideo])

  function handleVideoEnded() {
    playVideo(videos[0])
  }

  useEffect(() => {
    if (!currentVideo) return

    const src = URL.createObjectURL(currentVideo.file)
    setCurrentVideoSrc(src)

    return () => URL.revokeObjectURL(src)
  }, [currentVideo])

  function handleCardClick(videoId: string) {
    playVideo(videos.find((v) => v.videoId === videoId))
  }

  function playVideo(video: Video) {
    setCurrentVideo(video)
    updatePlaylist(playlist.id, { lastPlayedId: video.videoId })
  }

  if (loading)
    return <Loader size={25} className="animate-spin block mx-auto my-12" />

  if (!playlist) {
    return <p className="text-center bold text-xl">Playlist Not Found</p>
  }

  return (
    <main className="px-4 w-full md:mx-auto md:w-4/5">
      <video
        className="w-full max-h-[calc(100vh_-_92px)]"
        controls
        autoPlay
        src={currentVideoSrc}
        onEnded={handleVideoEnded}
      ></video>

      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl mt-3">{currentVideo?.title}</h1>
        <div>
          <b>{formatNumber(+currentVideo?.viewCount)}</b> views
        </div>
      </div>

      {currentVideo?.author && <AuthorCard author={currentVideo.author} />}

      <h2 className="mt-8 mb-3 text-xl font-medium">More Videos</h2>

      <div
        id="videos-list"
        className="grid gap-8 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      >
        {videos.map((video) => (
          <VideoCard
            videoInfo={video}
            key={video.videoId}
            onClick={handleCardClick}
          />
        ))}
      </div>
    </main>
  )
}
