import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Img,
  Easing,
} from 'remotion';

export interface VideoConfigProps {
  images: string[];
  title: string;
  price: string;
  location: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fontFamily: string;
}

const ImageSlide: React.FC<{ src: string; index: number; total: number }> = ({
  src,
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const slideDuration = durationInFrames / total;
  const startFrame = index * slideDuration;
  
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 15, startFrame + slideDuration - 15, startFrame + slideDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scale = interpolate(
    frame,
    [startFrame, startFrame + slideDuration],
    [1, 1.1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

export const MainComposition: React.FC<VideoConfigProps> = ({
  images,
  title,
  price,
  location,
  colorPalette,
  fontFamily,
}) => {
  const { durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  const textOpacity = interpolate(
    frame,
    [20, 40],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const textTranslateY = interpolate(
    frame,
    [20, 50],
    [30, 0],
    { easing: Easing.out(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', fontFamily }}>
      {images.map((img, i) => (
        <ImageSlide key={i} src={img} index={i} total={images.length} />
      ))}

      {/* Overlay con degradado para legibilidad */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)',
        }}
      />

      {/* Text Content */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          right: '5%',
          color: 'white',
          opacity: textOpacity,
          transform: `translateY(${textTranslateY}px)`,
        }}
      >
        <h1 style={{ fontSize: 80, margin: 0, color: colorPalette.accent, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          {title}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20 }}>
          <p style={{ fontSize: 40, margin: 0, fontWeight: 'bold' }}>{location}</p>
          <p style={{ fontSize: 50, margin: 0, color: colorPalette.primary, background: 'white', padding: '10px 30px', borderRadius: 50 }}>
            {price}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
