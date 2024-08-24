import { VideoInfoResponse } from './api'

export function getVideoSize(
  selectedFormat: VideoInfoResponse['selectedFormat']
) {
  let size: number, accurate: boolean

  if ('format' in selectedFormat) {
    size = +selectedFormat.format.contentLength
    accurate = true
  } else {
    size =
      +selectedFormat.audioFormat.contentLength +
      +selectedFormat.videoFormat.contentLength

    accurate = selectedFormat.videoFormat.container === 'webm'
  }

  // the size is inaccurate for high res mp4
  return {
    size,
    accurate,
  }
}
