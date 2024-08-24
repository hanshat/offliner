export function formatVideoDetails(details) {
  return {
    videoId: details.videoId,
    title: details.title,
    lengthSeconds: +details.lengthSeconds,
    publishDate: details.publishDate,
    videoUrl: details.video_url,
    viewCount: +details.viewCount,
    thumbnail: formatThumbnail(details.thumbnails),
    author: {
      name: details.author.name,
      subscriberCount: details.author.subscriber_count,
      user: details.author.user,
      thumbnail: formatThumbnail(details.author.thumbnails),
    },
  }
}

export function formatVideoFormats(formats) {
  let result = {}
  for (const key in formats) {
    if (Object.prototype.hasOwnProperty.call(formats, key)) {
      const format = formats[key]

      result[key] = {
        contentLength: format.contentLength,
        container: format.container,
      }
    }
  }

  return result
}

function formatThumbnail(thumbnails) {
  if (!thumbnails.length) return null

  const thumbnail = thumbnails.find((t) => t.height > 110)

  if (thumbnail) return thumbnail.url

  return thumbnails.at(-1).url
}
