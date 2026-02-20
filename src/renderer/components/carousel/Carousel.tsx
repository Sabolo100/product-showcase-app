import { useEffect, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCarouselStore } from '../../store/carouselStore'
import { useNavigationStore } from '../../store/navigationStore'
import MediaViewer from './MediaViewer'
import MediaCaption from './MediaCaption'
import FullscreenViewer from './FullscreenViewer'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'

export default function Carousel() {
  const { selectedProduct } = useNavigationStore()
  const { media, currentIndex, setMedia, setCurrentIndex, toggleFullscreen } = useCarouselStore()
  const swiperRef = useRef<SwiperType | null>(null)

  // Initialize media when product changes
  useEffect(() => {
    if (selectedProduct) {
      setMedia(selectedProduct.media)
    }
  }, [selectedProduct, setMedia])

  // Sync Swiper with store's currentIndex (for fullscreen navigation)
  useEffect(() => {
    const swiper = swiperRef.current
    if (swiper && swiper.activeIndex !== currentIndex) {
      swiper.slideTo(currentIndex, 0)
    }
  }, [currentIndex])

  if (!selectedProduct || media.length === 0) {
    return null
  }

  const currentMedia = media[currentIndex]

  // Direct navigation functions - simple and robust
  const goPrev = () => {
    const swiper = swiperRef.current
    if (swiper) {
      swiper.slidePrev()
    }
  }

  const goNext = () => {
    const swiper = swiperRef.current
    if (swiper) {
      swiper.slideNext()
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Fullscreen Viewer */}
      <FullscreenViewer />

      {/* Carousel */}
      <div className="flex-1 relative overflow-hidden">
        {/* Navigation Buttons - positioned outside swiper for consistent visibility */}
        {media.length > 1 && (
          <>
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="absolute left-8 top-1/2 -translate-y-1/2 z-20
                         p-4 bg-bg-secondary rounded-full shadow-xl
                         hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed
                         active:opacity-60 transition-opacity duration-100"
            >
              <ChevronLeft size={40} />
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex === media.length - 1}
              className="absolute right-8 top-1/2 -translate-y-1/2 z-20
                         p-4 bg-bg-secondary rounded-full shadow-xl
                         hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed
                         active:opacity-60 transition-opacity duration-100"
            >
              <ChevronRight size={40} />
            </button>
          </>
        )}

        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper
          }}
          onSlideChange={(swiper) => {
            setCurrentIndex(swiper.activeIndex)
          }}
          initialSlide={0}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          speed={300}
          coverflowEffect={{
            rotate: 10,
            stretch: 0,
            depth: 150,
            modifier: 1,
            slideShadows: false
          }}
          pagination={{
            clickable: true
          }}
          modules={[EffectCoverflow, Pagination]}
          className="w-full h-full"
        >
          {media.map((item, index) => (
            <SwiperSlide
              key={item.id}
              className="!flex !items-center !justify-center"
              style={{
                width: '60%',
                maxWidth: '800px',
                height: '100%'
              }}
            >
              <div
                onClick={() => {
                  const swiper = swiperRef.current
                  if (index === currentIndex) {
                    toggleFullscreen()
                  } else if (swiper) {
                    swiper.slideTo(index)
                  }
                }}
                className="w-full cursor-pointer flex items-center justify-center"
                style={{ height: 'calc(100% - 80px)' }}
              >
                <MediaViewer media={item} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Caption */}
      {currentMedia && (
        <div className="px-8 py-2">
          <MediaCaption media={currentMedia} />
        </div>
      )}
    </div>
  )
}
