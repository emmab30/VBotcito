import React from 'react'; // eslint-disable-line no-unused-vars

const TweetItemPreview = ({ tweet }) => {

    let backgroundURL = `https://elintransigente.com/wp-content/uploads/2020/09/twitter-logo-high-e1477757975960.jpg`;

    // If thumbnail, then select it
    if(tweet.thumbnail_link != null && tweet.thumbnail_link.length)
        backgroundURL = tweet.thumbnail_link;

    let payload = tweet.original_tweet_payload;
    let avatar = null;
    if(payload != null) {
        try {
            payload = JSON.parse(payload);
            avatar = payload.user.profile_image_url_https;
        } catch (err) {
            avatar = null;
        }
    }

    const tagColor = `#0054ff`;
    const tag = 'Tweet';

    return (
        <div className="member">

            { tag &&
                <div style={{ position: 'absolute', top: 0, left: 0, height: 'auto', width: 'auto', backgroundColor: tagColor, zIndex: 999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontWeight: 600, fontSize: 14, borderBottomRightRadius: 10, color: 'white', padding: 10 }}>
                    { tag + ' by ' }

                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        { avatar && avatar.length > 0 &&
                            <img src={avatar} style={{ maxWidth: 18, height: 18, borderRadius: 9, marginRight: 5 }} />
                        }
                        <a target={"_blank"} style={{ color: 'rgba(255,255,255,.75)' }} href={`https://twitter.com/${tweet.twitter_username}`}>@{ tweet.twitter_username }</a>
                    </div>
                </div>
            }

            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `url(${backgroundURL})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', backgroundPosition: 'center center' }} />
            <div className="member-info">
                <div className="member-info-content">
                    <h4>@{ tweet.tweet_username }</h4>
                    <span>{ tweet.tweet_text }</span>
                </div>

                <div className="social">
                    <a href={tweet.tweet_url} target="_blank"><i className="icofont-twitter"></i></a>
                </div>

                <a
                    target="_blank"
                    className="button"
                    href={tweet.tweet_url}
                    style={{ position: 'absolute', bottom: 0, width: '100%', margin: '0 auto', left: '0%', borderRadius: 0 }}>
                    {/* <i className="icofont-rolling-eyes" style={{ fontSize: 20, marginRight: 10, display: 'inline-block' }}></i> */}
                    View tweet
                </a>
            </div>
        </div>
    );
} 

export default TweetItemPreview;