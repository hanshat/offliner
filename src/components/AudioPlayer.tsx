import { ChevronLeft, ChevronRight } from 'lucide-react'
import './AudioPlayer.css'
import { Button } from './ui/button'

type Props = {
  src: string
  title: string
  onEnded: () => void
  playNext: () => void
  playPrevious: () => void
}

export default function AudioPlayer({
  src,
  title,
  onEnded,
  playNext,
  playPrevious,
}: Props) {
  return (
    <div className="audio-player">
      <h1 className="text-center text-lg pt-2">{title}</h1>
      <audio
        className="w-full"
        onEnded={onEnded}
        src={src}
        controls
        autoPlay
      ></audio>
      <div className="flex justify-center gap-2 pb-3">
        <Button variant="default" onClick={playPrevious}>
          <ChevronLeft /> Previous
        </Button>
        <Button variant="default" onClick={playNext}>
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
