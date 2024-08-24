type MediaFormat = {
  contentLength: number
  container: string
}

type SelectedFormat =
  | {
      videoFormat: MediaFormat
      audioFormat: MediaFormat
      highestAudioOnly: MediaFormat
    }
  | {
      format: MediaFormat
      highestAudioOnly: MediaFormat
    }

export type Author = {
  name: string
  subscriberCount: number
  user: string
  thumbnail: string
}

export type VideoInfoResponse = {
  videoId: string
  title: string
  videoUrl: string
  lengthSeconds: number
  publishDate: string
  viewCount: string
  selectedFormat: SelectedFormat
  author: Author
  thumbnail: string
}

export type Video = VideoInfoResponse & {
  file: File
  type: 'audio' | 'video'
  downloadedAt: Date
}
