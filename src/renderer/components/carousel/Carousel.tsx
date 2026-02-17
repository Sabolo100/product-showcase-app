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
      <div className="flex-1 relative">
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
          style={{
            paddingTop: '40px',
            paddingBottom: '80px'
          }}
        >
          {media.map((item, index) => (
            <SwiperSlide
              key={item.id}
              style={{
                width: '60%',
                maxWidth: '800px'
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
                className="w-full h-full cursor-pointer"
              >
                <MediaViewer media={item} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons - positioned with flexbox wrapper to avoid transform conflicts */}
        {media.length > 1 && (
          <>
            <div className="absolute left-8 top-0 bottom-0 z-10 flex items-center">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="p-4 bg-bg-secondary rounded-full shadow-xl
                           hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed
                           active:opacity-60 transition-opacity duration-100"
              >
                <ChevronLeft size={40} />
              </button>
            </div>
            <div className="absolute right-8 top-0 bottom-0 z-10 flex items-center">
              <button
                onClick={goNext}
                disabled={currentIndex === media.length - 1}
                className="p-4 bg-bg-secondary rounded-full shadow-xl
                           hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed
                           active:opacity-60 transition-opacity duration-100"
              >
                <ChevronRight size={40} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Caption */}
      {currentMedia && (
        <div className="px-8 py-6 bg-bg-secondary">
          <MediaCaption media={currentMedia} />
        </div>
      )}
    </div>
  )
}
