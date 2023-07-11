import React, { useRef } from 'react'; // eslint-disable-line no-unused-vars

const VideoItemPreview = ({ url, onVideoChange }) => {

    const [isPlaying, setPlaying] = React.useState(false);
    const videoRef = useRef();

    const tag = 'Video';
    const tagColor = `#00a25b`;

    return (
        <div className="member">

            { tag &&
                <div style={{ position: 'absolute', top: 0, left: 0, height: 'auto', width: '100%', backgroundColor: tagColor, zIndex: 999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontWeight: 600, fontSize: 14, color: 'white', padding: 10 }}>
                    { tag }

                    {/* <div style={{ display: 'flex', flexDirection: 'row' }}>
                        { avatar && avatar.length > 0 &&
                            <img src={avatar} style={{ maxWidth: 18, height: 18, borderRadius: 9, marginRight: 5 }} />
                        }
                        <a target={"_blank"} style={{ color: 'rgba(255,255,255,.75)' }} href={`https://twitter.com/${tweet.twitter_username}`}>@{ tweet.twitter_username }</a>
                    </div> */}
                </div>
            }

            <video ref={videoRef} loop muted preload="metadata" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0}}>
                <source src={`${url}#t=0.5`} type='video/mp4' />
            </video>

            <div className="member-info">
                <a
                    target="_blank"
                    className="button"
                    onClick={() => {
                        if(!isPlaying) {
                            setPlaying(true);
                            onVideoChange(true);
                            videoRef.current.play();
                        } else {
                            onVideoChange(false);
                        }
                    }}
                    style={{ position: 'absolute', bottom: 0, width: '100%', margin: '0 auto', left: '0%', borderRadius: 0 }}>
                    { !isPlaying && 'Flash View Video' }
                </a>
            </div>
        </div>
    );
} 

export default VideoItemPreview;