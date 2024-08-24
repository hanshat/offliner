import fs from 'fs'
import ytdl from '@distube/ytdl-core'
import { captureException } from '@sentry/node'

import {
  downloadHighestQualityVideo,
  downloadHighestQyalityAudio,
  selectFormat,
} from '../utils/video.js'
import { logger } from '../utils/logger.js'
import { pipeline } from 'stream'
import {
  formatVideoDetails,
  formatVideoFormats,
} from '../formatters/videoDetailsFormatter.js'

const TMP_FILE = 'file_' + crypto.randomUUID()

export const videoInfo = async (req, res) => {
  const { url } = req.query

  if (!url) return res.send({ error: 'url query is required' })

  try {
    const info = await ytdl.getInfo(url)
    const selectedFormat = selectFormat(info.formats)

    res.send({
      ...formatVideoDetails(info.videoDetails),
      selectedFormat: formatVideoFormats(selectedFormat),
    })
  } catch (error) {
    res.status(500).send({ error: error.toString() })
  }
}

export const videoDownload = async (req, res) => {
  const { url, audioOnly } = req.query

  if (!url) return res.send({ error: 'url query is required' })

  let stream
  if (audioOnly) {
    stream = await downloadHighestQyalityAudio(url, res)
  } else {
    stream = await downloadHighestQualityVideo(url, res)
  }

  stream
    .on('error', (err) => {
      logger.error(err.toString())
      captureException(err)

      if (res.writableEnded) return
      req.destroy()
      !res.headersSent && res.removeHeader('Content-Length')
      res.status(err.statusCode || 500).end()
    })
    .pipe(res)
}

export const videoDownloadFirst = async (req, res) => {
  const { url } = req.query

  const downloadStream = await downloadHighestQualityVideo(url, res)

  const deleteTmpFile = () => fs.unlink(TMP_FILE, (err) => err && logger.error)

  const handleError = (err) => {
    logger.error(err)
    captureException(err)
    deleteTmpFile()
    res.status(500).end()
  }

  pipeline(downloadStream, fs.createWriteStream(TMP_FILE), (err) => {
    if (err) {
      return handleError(err)
    }

    const size = fs.statSync(TMP_FILE).size
    res.header('Content-Length', size)
    pipeline(fs.createReadStream(TMP_FILE), res, (err) => {
      if (err) {
        return handleError(err)
      }

      deleteTmpFile()
    })
  })
}
