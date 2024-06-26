// import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Header.scss';
import YouTube, { YouTubeProps } from 'react-youtube';
const logo: string = './assets/images/icons/logoNeonPink.svg'

export const Header = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showVideo, setShowVideo] = useState(false)

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
  }

  const opts: YouTubeProps['opts'] = {
    height: windowSize.height <= 600 ? '200' : '390',
    width: windowSize.width <= 600 ? '300' : '640',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className='header-cont'>

{
  showVideo && (
    <div className='video-cont'>
      <button onClick={() => setShowVideo(false)}>&times;</button>
      <YouTube videoId="cqg_ytPT428" opts={opts} onReady={onPlayerReady} />
    </div>
  )

}

      <div className="header-content">
        <img src={logo} alt="" />
        <h1>IMMERSE IN VR RHYTHM</h1>
        <h3> Create, Smash, Repeat!</h3>

        <div className="buttons-cont">
          <a target='_blank' href='https://drive.google.com/drive/folders/1BiylXMbYbM_FFtpbQv8ShQo3aeCVtk7Z?usp=sharing'>

          <button className="btn">
            <span>download PC demo</span>
          </button>
          </a>

          <button onClick={() => setShowVideo(true)} className='btn purple'>
              <span>TRAILER</span>
            </button>

          {/* <NavLink to={'beat-generation'}>
            <button className='btn purple'>
              <span>GENERATE MUSIC</span>
            </button>
          </NavLink> */}
        </div>
      </div>

    </div>
  )
}
