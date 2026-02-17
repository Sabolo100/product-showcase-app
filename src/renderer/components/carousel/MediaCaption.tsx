import { MediaFile } from '../../types'

interface MediaCaptionProps {
  media: MediaFile
}

export default function MediaCaption({ media }: MediaCaptionProps) {
  if (!media.caption && !media.description) {
    return null
  }

  return (
    <div className="text-center">
      {media.caption && (
        <h3 className="text-2xl font-bold mb-2">{media.caption}</h3>
      )}
      {media.description && (
        <p className="text-text-secondary text-lg">{media.description}</p>
      )}
    </div>
  )
}
