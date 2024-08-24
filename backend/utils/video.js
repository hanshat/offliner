import cp from 'child_process'
import ffmpeg from 'ffmpeg-static'
import ytdl from '@distube/ytdl-core'
import { logger } from './logger.js'

export const QUALITY_ITAG_MAP_1080p = {
  mp4: {
    audio: [140, 141],
    video: [137, 299, 399],
  },
  webm: {
    audio: [251],
    video: [248],
  },
}

export async function downloadHighestQualityVideo(url, res) {
  const info = await ytdl.getInfo(url)
  const selectedFormat = selectFormat(info.formats)

  if (selectedFormat.format)
    return downloadLowQualityVideo(selectedFormat.format, url, res)

  const { audioFormat, videoFormat } = selectedFormat

  const contentType =
    videoFormat.container === 'webm' ? 'video/webm' : 'video/mp4'

  res.header('Content-Type', contentType)
  if (videoFormat.container === 'webm') {
    res.header(
      'Content-Length',
      +audioFormat.contentLength + +videoFormat.contentLength
    )
  }

  const audio = ytdl(url, { format: audioFormat })
  const video = ytdl(url, { format: videoFormat })

  const mergeStream = mergeAudioAndVideo(audio, video, videoFormat.container)

  return mergeStream
}

function mergeAudioAndVideo(audioStream, videoStream, outputContainer) {
  const ffmpegProcess = cp.spawn(
    ffmpeg,
    [
      // Remove ffmpeg's console spamming
      ['-loglevel', '0', '-hide_banner'],

      // Set inputs
      ['-i', 'pipe:3'],
      ['-i', 'pipe:4'],

      // Map audio & video from streams
      ['-map', '0:a'],
      ['-map', '1:v'],

      outputContainer === 'mp4' ? ['-movflags', 'isml+frag_keyframe'] : [],
      // Keep video encoding. encode audio as flac
      ['-c:v', 'copy'],
      ['-c:a', 'copy'],

      ['-f', outputContainer, 'pipe:5'],
    ].flat(),
    {
      windowsHide: true,
      stdio: [
        /* Standard: stdin, stdout, stderr */
        'inherit',
        'inherit',
        'inherit',
        /* Custom: pipe:3, pipe:4, pipe:5 */
        'pipe',
        'pipe',
        'pipe',
      ],
    }
  )

  audioStream
    .on('error', (err) => onDownloadStreamError(err, ffmpegProcess.stdio[5]))
    .pipe(ffmpegProcess.stdio[3])
  videoStream
    .on('error', (err) => onDownloadStreamError(err, ffmpegProcess.stdio[5]))
    .pipe(ffmpegProcess.stdio[4])

  ffmpegProcess.stdio[3].on('error', (err) => {
    logger.child({ type: 'audio' }).error(err)
  })
  ffmpegProcess.stdio[4].on('error', (err) => {
    logger.child({ type: 'audio' }).error(err)
  })

  return ffmpegProcess.stdio[5]
}

function onDownloadStreamError(error, stream) {
  stream.emit('error', error.toString())
}

function downloadLowQualityVideo(format, url, res) {
  res.header('Content-Type', format.mimeType.split(';')[0])
  res.header('Content-Length', format.contentLength)

  return ytdl(url, { format: format })
}

export function selectFormat(formats = []) {
  let audioFormat, videoFormat
  for (const container in QUALITY_ITAG_MAP_1080p) {
    const { audio, video } = QUALITY_ITAG_MAP_1080p[container]
    try {
      audioFormat = formats.find((f) => audio.includes(f.itag))
      videoFormat = formats.find((f) => video.includes(f.itag))

      if (audioFormat && videoFormat) break
    } catch (error) {
      logger.error('error choosing format', error)
    }
  }

  const highestAudioOnly = ytdl.chooseFormat(formats, {
    quality: 'highestaudio',
    filter: 'audioonly',
  })
  if (!audioFormat || !videoFormat) {
    const format = ytdl.chooseFormat(formats, {
      quality: 'highestvideo',
      filter: (f) => f.hasAudio && f.hasVideo,
    })

    return { format, highestAudioOnly }
  }

  return { audioFormat, videoFormat, highestAudioOnly }
}

export async function downloadHighestQyalityAudio(url, res) {
  const info = await ytdl.getInfo(url)

  const format = selectFormat(info.formats).highestAudioOnly

  res.header('Content-Type', format.mimeType.split(';')[0])
  res.header('Content-Length', format.contentLength)

  return ytdl(url, { format })
}
