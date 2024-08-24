import os from 'node:os'
import { createLogger, format, transports } from 'winston'
import 'winston-syslog'

const papertrail = new transports.Syslog({
  host: 'logs4.papertrailapp.com',
  port: 13065,
  protocol: 'tls4',
  localhost: os.hostname(),
  eol: '\n',
})

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
  exceptionHandlers: [new transports.File({ filename: 'exceptions.log' })],
  rejectionHandlers: [new transports.File({ filename: 'rejections.log' })],
})

if (process.env.NODE_ENV === 'production') {
  logger.add(papertrail)
}

export { logger }
