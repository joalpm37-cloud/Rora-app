import { Composition } from 'remotion';
import { MainComposition } from './Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={MainComposition}
        durationInFrames={150} // 5 segundos a 30fps
        fps={30}
        width={1080}
        height={1920} // Formato vertical (Reels/TikTok/Shorts)
        defaultProps={{
          images: [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1080&h=1920',
          ],
          title: 'Propiedad de Lujo',
          price: '$500,000',
          location: 'Santa Marta, Colombia',
          colorPalette: {
            primary: '#1a1a1a',
            secondary: '#ffffff',
            accent: '#d4af37', // Dorado
          },
          fontFamily: 'Inter, sans-serif',
        }}
      />
    </>
  );
};
