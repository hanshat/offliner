import { Router } from 'express'
import {
  videoDownload,
  videoDownloadFirst,
  videoInfo,
} from '../controllers/video.controller.js'

const router = Router()

router.get('/video/info', videoInfo)

router.get('/video/download', videoDownload)

// Download file to disk then stream result to response
router.get('/video/download-first', videoDownloadFirst)

export default router
