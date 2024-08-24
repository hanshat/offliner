import CreatePlaylistModal from '@/components/CreatePlaylistModal'
import useAsync from '@/components/hooks/useAsync'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { toast } from '@/components/ui/use-toast'
import { delPlaylist, getAllPlaylists } from '@/lib/playlist'
import { formatSeconds } from '@/lib/utils'
import { ChevronsUpDown, Edit, Loader, Trash } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Fragment } from 'react/jsx-runtime'
import { captureException } from '@sentry/react'

export default function Playlists() {
  const { loading, value: playlists, refresh } = useAsync(getAllPlaylists)

  async function removePlaylist(name: string) {
    try {
      await delPlaylist(name)
      refresh()
      toast({ title: 'Playlist removed' })
    } catch (error) {
      captureException(error)
      toast({ title: 'An error occurred!' })
    }
  }
  function getPlaylistLink(playlist) {
    if (playlist.type === 'audio') return `/audio?list=${playlist.id}`

    return `/playlists/${playlist.id}`
  }

  return (
    <main className="max-w-[var(--max-app-w)] mx-auto px-4 md:px-0">
      <div className="flex justify-between items-center mb-5">
        <h1>Playlists</h1>
        <CreatePlaylistModal onOpenChange={(_) => refresh()}>
          <Button variant="default">Create</Button>
        </CreatePlaylistModal>
      </div>

      {loading ? (
        <Loader size={25} className="animate-spin block mx-auto my-12" />
      ) : playlists.length === 0 ? (
        <p className="text-xl text-center text-muted-foreground">
          Nothing to show here!
        </p>
      ) : (
        <div>
          {playlists.map((p) => (
            <Collapsible key={p.id} className="space-y-2">
              <div className="flex items-center border mb-2 rounded p-2">
                <Link to={getPlaylistLink(p)} className="flex-grow">
                  {p.name}: ({p.videos.length})
                </Link>

                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>

                <CreatePlaylistModal
                  playlist={p}
                  onOpenChange={(open) => !open && refresh()}
                >
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </CreatePlaylistModal>

                <Button
                  onClick={() => removePlaylist(p.id)}
                  variant="ghost"
                  className="hover:bg-red-500 hover:text-white"
                  size="icon"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              <CollapsibleContent className="space-y-2 pb-4 px-4">
                {p.videos.map((v, idx) => (
                  <Fragment key={v.videoId}>
                    <div className="flex gap-2">
                      <img
                        src={v.thumbnail}
                        alt={p.name}
                        className="h-12 w-12 rounded aspect-video object-cover"
                      />
                      <div>
                        <p>{v.title}</p>
                        <p>{formatSeconds(+v.lengthSeconds)}</p>
                      </div>
                    </div>
                    {idx < p.videos.length - 1 && <hr />}
                  </Fragment>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}
    </main>
  )
}
