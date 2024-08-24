import AuthorCard from '@/components/AuthorCard'
import VideoCard from '@/components/VideoCard'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { getAllVideos } from '@/lib/FileSystemManager'
import { Video } from '@/lib/api'
import { getOption, setOption } from '@/lib/options'
import { formatNumber } from '@/lib/utils'
import { Loader } from 'lucide-react'
import { ElementRef, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function VideoPlayer() {
  let { videoId } = useParams()
  const videoRef = useRef<ElementRef<'video'>>(null)
  const [videoDetails, setVideoDetails] = useState<Video>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [autoPlay, setAutoPlay] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllVideos({ type: 'video' }).then((videos) => {
      const videoIndex = videos.findIndex((v) => v.videoId === videoId)
      const previousVideos = videos.slice(0, videoIndex)
      const currentVideo = videos.slice(videoIndex, videoIndex + 1)
      const nextVideos = videos.slice(videoIndex + 1)

      setVideoDetails(currentVideo[0])
      setVideos(nextVideos.concat(previousVideos))
      setLoading(false)
    })
  }, [videoId])

  useEffect(() => {
    getOption('autoPlay').then(setAutoPlay)
  }, [])

  // auto play next
  useEffect(() => {
    if (!videoRef.current) return

    if (autoPlay) {
      videoRef.current.addEventListener('ended', autoPlayNextVideo)
    } else {
      videoRef.current.removeEventListener('ended', autoPlayNextVideo)
    }
  }, [autoPlay, videoRef])

  function autoPlayNextVideo() {
    ;(document.querySelector('#videos-list a') as HTMLAnchorElement)?.click()
  }

  function loadVideos() {
    getAllVideos().then((videos) => {
      setVideos(videos.filter((v) => v.videoId !== videoId))
    })
  }

  async function handleAutoPlayChange(checked: boolean) {
    setAutoPlay(checked)
    await setOption('autoPlay', checked)
  }

  useEffect(() => {
    if (!videoRef.current || !videoDetails) return

    const src = URL.createObjectURL(videoDetails.file)
    const video = videoRef.current
    video.src = src

    // hack to make webm video seekable
    // https://stackoverflow.com/questions/21522036/html-audio-tag-duration-always-infinity
    // video.addEventListener('loadedmetadata', () => {
    //   if (video.duration === Infinity || isNaN(Number(video.duration))) {
    //     video.currentTime = 1e101
    //     video.addEventListener('timeupdate', getDuration)
    //   }
    // })

    // function getDuration(event: Event) {
    //   // @ts-expect-error
    //   event.target.currentTime = 0
    //   event.target.removeEventListener('timeupdate', getDuration)
    // }

    return () => URL.revokeObjectURL(src)
  }, [videoRef.current, videoDetails?.videoId])

  if (loading)
    return <Loader size={25} className="animate-spin block mx-auto my-12" />

  if (!videoDetails) return <p className="text-center">Video Not Found</p>

  return (
    <main className="px-4 w-full md:mx-auto md:w-4/5">
      <video
        className="w-full max-h-[calc(100vh_-_92px)]"
        controls
        autoPlay
        ref={videoRef}
      ></video>

      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl mt-3">{videoDetails.title}</h1>
        <div>
          <b>{formatNumber(+videoDetails.viewCount)}</b> views
        </div>
      </div>

      <AuthorCard author={videoDetails.author} />

      {!!videos.length && (
        <div className="flex items-center justify-between">
          <h2 className="mt-8 mb-3 text-xl font-medium">More Videos</h2>
          <div className="flex items-center  gap-2">
            <Label htmlFor="auto-pla" className="text-md">
              Auto Play
            </Label>
            <Switch
              id="auto-play"
              className="h-full"
              onCheckedChange={handleAutoPlayChange}
              checked={autoPlay}
            />
          </div>
        </div>
      )}

      <div
        id="videos-list"
        className="grid gap-8 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      >
        {videos.map((video) => (
          <VideoCard
            videoInfo={video}
            key={video.videoId}
            onDelete={loadVideos}
          />
        ))}
      </div>
    </main>
  )
}
