import { SyntheticEvent, useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { getAllVideos } from '@/lib/FileSystemManager'
import { Checkbox } from './ui/checkbox'
import { ScrollArea } from './ui/scroll-area'
import { Playlist, createPlaylist, updatePlaylist } from '@/lib/playlist'
import { toast } from './ui/use-toast'
import { DialogClose } from '@radix-ui/react-dialog'

type Props = {
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
  playlist?: Playlist
}

type Video = {
  title: string
  videoId: string
  type: 'video' | 'audio'
}

export default function CreatePlaylistModal({
  playlist,
  children,
  onOpenChange,
}: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState(playlist?.name || '')
  const [type, setType] = useState<'video' | 'audio'>(playlist?.type)
  const [selectedIds, setSelectedIds] = useState(
    playlist?.videos?.map((v) => v.videoId) || []
  )

  async function saveChanges(e: SyntheticEvent) {
    e.preventDefault()

    if (selectedIds.length === 0) {
      toast({ title: 'No videos selected', duration: 1500 })

      return
    }

    try {
      if (playlist) {
        await updatePlaylist(playlist.id, { name, videoIds: selectedIds })
      } else {
        await createPlaylist(name, selectedIds, type)
      }

      closeBtnRef.current?.click()
      toast({ title: 'Playlist created!', duration: 900 })
      resetForm()
    } catch (error) {
      toast({ title: error.message || error.toString(), duration: 1500 })
    }
  }

  function handleCheckedChange(videoId: string) {
    return (checked: boolean) => {
      if (checked) setSelectedIds([...selectedIds, videoId])
      else {
        setSelectedIds(selectedIds.toSpliced(selectedIds.indexOf(videoId), 1))
      }
    }
  }

  useEffect(() => {
    setLoading(true)
    getAllVideos({ type }).then((videos) => {
      setVideos(
        videos.map(({ title, videoId, type }) => ({ title, videoId, type }))
      )

      setLoading(false)
    })
  }, [type])

  function resetForm() {
    setName(playlist?.name || '')
    setSelectedIds(playlist?.videos?.map((v) => v.videoId) || [])
  }

  function handleTypeChange(e: any) {
    // reset selected videos
    setSelectedIds([])

    setType(e.target.value as Video['type'])
  }

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[calc(100%-20px)] md:max-w-[var(--max-app-w)]">
        <DialogHeader>
          <DialogTitle>New Playlists</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <form id="playlists-form" className="py-4" onSubmit={saveChanges}>
            <div>
              <Label htmlFor="name" className="mb-2 block">
                Name
              </Label>
              <Input
                id="name"
                autoComplete="off"
                required
                className="col-span-3"
                value={name}
                onChange={(e: any) => setName(e.target.value)}
              />
            </div>

            <div className="mt-5">
              <Label htmlFor="type" className="mb-2 block">
                Name
              </Label>
              <select
                required
                className="w-full ring-1 ring-input px-3 py-2 text-sm ring-offset-background h-10 rounded-md"
                value={type}
                onChange={handleTypeChange}
              >
                <option value="">Selected a type</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
              </select>
            </div>

            <div>
              <p className="mt-3 mb-2">Select videos</p>

              <ScrollArea className="h-72 w-full rounded-md border p-2">
                {videos.map((v) => (
                  <div
                    className="flex items-center gap-2 hover:bg-gray-100 py-2"
                    key={v.videoId}
                  >
                    <Checkbox
                      id={v.videoId}
                      value={v.videoId}
                      checked={selectedIds.includes(v.videoId)}
                      onCheckedChange={handleCheckedChange(v.videoId)}
                    />
                    <label
                      htmlFor={v.videoId}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {v.title}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </form>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="link" ref={closeBtnRef}>
              Close
            </Button>
          </DialogClose>
          <Button form="playlists-form" type="submit">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
