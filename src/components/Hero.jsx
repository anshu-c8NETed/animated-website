import { useEffect, useRef, useState } from "react";
import { TiLocationArrow } from "react-icons/ti";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const Button = ({ id, title, leftIcon, rightIcon, containerClass }) => (
  <button
    id={id}
    className={`px-6 py-3 rounded-full font-medium transition-all hover:scale-105 active:scale-95 ${containerClass}`}
  >
    {leftIcon && <span className="mr-2 inline-block">{leftIcon}</span>}
    {title}
    {rightIcon && <span className="ml-2 inline-block">{rightIcon}</span>}
  </button>
);

const VideoPreview = ({ children }) => (
  <div className="relative w-full h-full">{children}</div>
);

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const totalVideos = 4;
  const nextVdRef = useRef(null);
  const currentVdRef = useRef(null);

  const handleVideoLoad = () => {
    setLoadedVideos((prev) => {
      const newCount = prev + 1;
      setLoadingProgress(Math.round((newCount / (totalVideos - 1)) * 100));
      return newCount;
    });
  };

  useEffect(() => {
    if (loadedVideos === totalVideos - 1) {
      // Smooth transition out of loading state
      setTimeout(() => setLoading(false), 500);
    }
  }, [loadedVideos]);

  const handleMiniVdClick = () => {
    setHasClicked(true);
    setCurrentIndex((prevIndex) => (prevIndex % totalVideos) + 1);
  };

  // Video transition animation
  useGSAP(
    () => {
      if (hasClicked) {
        gsap.set("#next-video", { visibility: "visible" });
        
        const tl = gsap.timeline();
        
        tl.to("#next-video", {
          transformOrigin: "center center",
          scale: 1,
          width: "100%",
          height: "100%",
          duration: 1,
          ease: "power1.inOut",
          onStart: () => nextVdRef.current?.play(),
        })
        .from("#current-video", {
          transformOrigin: "center center",
          scale: 0,
          duration: 1.5,
          ease: "power1.inOut",
        }, "-=0.5");
      }
    },
    {
      dependencies: [currentIndex],
      revertOnUpdate: true,
    }
  );

  // Scroll-triggered clip path animation
  useGSAP(() => {
    gsap.set("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  // Fade in animation for hero content
  useGSAP(() => {
    if (!loading) {
      gsap.from(".hero-content", {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power2.out",
        stagger: 0.2,
      });
    }
  }, [loading]);

  const getVideoSrc = (index) => `videos/hero-${index}.mp4`;

  return (
    <div className="relative h-dvh w-screen overflow-x-hidden">
      {/* Enhanced Loading Screen */}
      {loading && (
        <div className="flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-gradient-to-br from-violet-50 via-blue-50 to-purple-50">
          <div className="text-center">
            {/* Loading Animation */}
            <div className="three-body mb-8">
              <div className="three-body__dot"></div>
              <div className="three-body__dot"></div>
              <div className="three-body__dot"></div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            
            {/* Progress Text */}
            <p className="mt-4 text-sm font-medium text-gray-700">
              Loading experience... {loadingProgress}%
            </p>
          </div>
        </div>
      )}

      <div
        id="video-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-blue-75"
      >
        <div>
          {/* Mini Video Preview (Interactive Element) */}
          <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
            <VideoPreview>
              <div
                onClick={handleMiniVdClick}
                className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100 group"
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleMiniVdClick();
                  }
                }}
                aria-label="Switch to next video"
              >
                <video
                  ref={currentVdRef}
                  src={getVideoSrc((currentIndex % totalVideos) + 1)}
                  loop
                  muted
                  playsInline
                  id="current-video"
                  className="size-64 origin-center scale-150 object-cover object-center group-hover:scale-[1.6] transition-transform duration-300"
                  onLoadedData={handleVideoLoad}
                />
                
                {/* Hover Indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-md rounded-full p-4">
                    <TiLocationArrow className="w-8 h-8 text-white animate-pulse" />
                  </div>
                </div>
              </div>
            </VideoPreview>
          </div>

          {/* Next Video (Transition Element) */}
          <video
            ref={nextVdRef}
            src={getVideoSrc(currentIndex)}
            loop
            muted
            playsInline
            id="next-video"
            className="absolute-center invisible absolute z-20 size-64 object-cover object-center"
            onLoadedData={handleVideoLoad}
          />

          {/* Background Video */}
          <video
            src={getVideoSrc(
              currentIndex === totalVideos - 1 ? 1 : currentIndex
            )}
            autoPlay
            loop
            muted
            playsInline
            className="absolute left-0 top-0 size-full object-cover object-center"
            onLoadedData={handleVideoLoad}
          />
        </div>

        {/* Bottom Right Title */}
        <h1 className="special-font hero-heading absolute bottom-5 right-5 z-40 text-blue-75 hero-content">
          G<b>A</b>MING
        </h1>

        {/* Hero Content Overlay */}
        <div className="absolute left-0 top-0 z-40 size-full pointer-events-none">
          <div className="mt-24 px-5 sm:px-10 pointer-events-auto">
            <h1 className="special-font hero-heading text-blue-100 hero-content">
              redefi<b>n</b>e
            </h1>

            <p className="mb-5 max-w-64 font-robert-regular text-blue-100 hero-content leading-relaxed">
              Enter the Metagame Layer <br /> Unleash the Play Economy
            </p>

            <div className="hero-content">
              <Button
                id="watch-trailer"
                title="Watch trailer"
                leftIcon={<TiLocationArrow />}
                containerClass="bg-yellow-300 flex items-center justify-center gap-1 hover:bg-yellow-400 shadow-lg hover:shadow-xl text-black font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Title (Outside Frame) */}
      <h1 className="special-font hero-heading absolute bottom-5 right-5 text-black">
        G<b>A</b>MING
      </h1>
    </div>
  );
};

export default Hero;
