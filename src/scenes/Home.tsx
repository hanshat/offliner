import { useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  EyeOff,
  FolderLock,
  ListVideo,
  Loader,
  Search,
  SendToBack,
  Share2,
  Wind,
} from 'lucide-react'
import VideoDownloadCard from '@/components/VideoDownloadCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import RecentDownloads from '@/components/RecentDownloads'
import { VideoInfoResponse } from '@/lib/api'

function Home() {
  let [searchParams] = useSearchParams()
  const [url, setUrl] = useState(searchParams.get('description') || '')
  const [videoDetails, setVideoDetails] = useState<VideoInfoResponse>()
  const [fetching, setFetching] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const getInfo = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    setFetching(true)

    try {
      const response = await fetch(`/api/video/info?url=${url}`)
      const data = await response.json()

      if (response.ok) {
        setVideoDetails(data)
        setError(null)
      } else {
        setError(data.error.toString())
      }
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    // description comes from being a share_target. it contains the url
    const description = searchParams.get('description')

    if (description) {
      getInfo()
    }
  }, [])

  return (
    <main>
      <div className="mb-8 bg-primary -mt-10 px-4 md:px-0 pb-8">
        <h1 className="text-3xl md:text-5xl text-center font-semibold pt-16 mb-3 text-accent-foreground">
          Download YouTube Videos Easily
        </h1>
        <p className="mb-20 text-md md:text-xl text-center text-accent-foreground">
          Paste a YouTube video URL and download it in high quality.
        </p>

        <form
          onSubmit={getInfo}
          className="mb-8 max-w-[var(--max-app-w)] md:mx-auto"
        >
          <div className="flex gap-4">
            <Input
              type="text"
              name="url"
              autoComplete="off"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={(e) => {
                e.target.select()
              }}
              placeholder="https://youtu.be/dQw4w9WgXcQ"
              autoFocus
            />

            <Button variant="outline">
              {fetching ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <Search size={20} />
              )}
            </Button>
          </div>
          {error && (
            <span className="text-red-400 font-semibold text-sm">{error}</span>
          )}
        </form>

        {videoDetails && (
          <div className="max-w-[var(--max-app-w)] md:mx-auto text-accent-foreground">
            <VideoDownloadCard videoInfo={videoDetails} />
          </div>
        )}
      </div>

      <div className="max-w-[var(--max-app-w)] md:mx-auto mb-12 px-4 md:px-0">
        <h2 className="text-primary text-2xl md:text-3xl text-center mt-12">
          Latest Downloads
        </h2>
        <p className="text-primary text-center mb-8">
          Check out the most recently downloaded videos
        </p>

        <RecentDownloads />
      </div>

      <div className="max-w-[var(--max-app-w)] md:mx-auto px-4 md:px-0">
        <h3 className="text-primary text-2xl md:text-3xl text-center">
          Features You'll Love
        </h3>
        <p className="text-primary text-center mt-1 mb-8">
          Offliner strive to make the whole experience as smooth as possible.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
          <div className="flex flex-col">
            <div className="flex gap-3 mb-3">
              <Wind />
              <p>Simple & straightforward</p>
            </div>
            <p className="text-muted-foreground leading-5">
              Past the URL and download the video. That's it. Now, you are all
              set. You can watch any time you want.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="flex gap-3 mb-3">
              <EyeOff />

              <p>No ads or tracking</p>
            </div>
            <p className="text-muted-foreground leading-5">
              We don't deliver ads to use tracking software. Your viewing
              activity is not collected or shared with any one not even us.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="flex gap-3 mb-3">
              <SendToBack />
              <p>Download in the background</p>
            </div>
            <p className="text-muted-foreground leading-5">
              Downloads are launched in the background. So you don't have to
              worry about closing the website.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="flex gap-3 mb-3">
              <FolderLock />
              <p>Secure & Private</p>
            </div>
            <p className="text-muted-foreground leading-5">
              Your downloaded videos are stored in a secure folder in you
              machine. they can be accessed only through the website.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="flex gap-3 mb-3">
              <ListVideo />
              <p>Create playlists</p>
            </div>
            <p className="text-muted-foreground leading-5">
              You can create multiple playlists for you different viewing
              preferences.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="flex gap-3 mb-3">
              <Share2 />

              <p>Share from youtube</p>
            </div>
            <p className="text-muted-foreground leading-5">
              Watching a Youtube video and want to store for later? Just share
              it with the website.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home
