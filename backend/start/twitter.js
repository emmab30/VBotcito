let ENABLE_TWITTER = false;

setTimeout(() => {
  if(!ENABLE_TWITTER)
    return;

  /* Twitter API for listening for mentions */
  var Twitter = require('twitter');
  const Env = use('Env');
  const _ = require('lodash');

  var client = new Twitter({
    consumer_key: Env.get('TWITTER_CONSUMER_KEY'),
    consumer_secret: Env.get('TWITTER_CONSUMER_SECRET'),
    access_token_key: Env.get('TWITTER_ACCESS_TOKEN_KEY'),
    access_token_secret: Env.get('TWITTER_ACCESS_TOKEN_SECRET')
  });

  client.stream('statuses/filter', {track: 'vbotcito'},  function(stream) {
    stream.on('data', (tweet) => {
      const originalTweet = tweet;
      const tweetID = tweet.id_str;
      const username = tweet.user.screen_name;
      const parentTweetID = tweet.in_reply_to_status_id_str;
      if(!parentTweetID){
        console.log(`No parent tweet. Skipping..`);
        return;
      }

      /* console.log(`Original tweet`, JSON.stringify(tweet)); */

      client.get(`statuses/show/${parentTweetID}`, { tweet_mode: 'extended' }, (error, tweet, response) => {
        if(!error) {
          /* console.log(`Parent tweet`, JSON.stringify(tweet)); */

          let extendedEntities = tweet.extended_entities;
          let videoFound = false;

          const TweetVideo = use('App/Models/TweetVideo');
          if(extendedEntities != null) {
            extendedEntities = extendedEntities.media;
            for(var idx in extendedEntities) {
              const entity = extendedEntities[idx];
              if(entity.type == 'video') {
                let variants = entity.video_info.variants;
                variants = _.orderBy(variants, ['bitrate'], ['asc']);
                variants = _.filter(variants, (i) => i.bitrate > 0);
                const bestVariant = _.last(variants);
                const urlBestVariant = bestVariant.url;

                TweetVideo.create({
                  twitter_username: username,
                  tweet_id_str: parentTweetID,
                  tweet_username:  tweet.user.screen_name,
                  tweet_text: tweet.full_text.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, ''),
                  tweet_url: `https://www.twitter.com/${tweet.user.screen_name}/status/${parentTweetID}`,
                  thumbnail_link: entity.media_url_https,
                  video_link: urlBestVariant,
                  tweet_payload: JSON.stringify(tweet),
                  original_tweet_payload: JSON.stringify(originalTweet)
                }).then((data) => {
                  client.post('statuses/update', {
                    in_reply_to_status_id: tweetID,
                    status: `@${username} All set! Check out: vbotcito.com/user/${username}`,
                    auto_populate_reply_metadata: true
                  }, (err, data, response) => {
                    /* console.log(`Replied to tweet: ${tweetID}`, JSON.stringify(data), err); */
                  });
                });
              } else if(entity.type == 'photo') {
                TweetVideo.create({
                  twitter_username: username,
                  tweet_id_str: parentTweetID,
                  tweet_username:  tweet.user.screen_name,
                  tweet_text: tweet.full_text.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, ''),
                  tweet_url: `https://www.twitter.com/${tweet.user.screen_name}/status/${parentTweetID}`,
                  thumbnail_link: entity.media_url_https,
                  tweet_payload: JSON.stringify(tweet),
                  original_tweet_payload: JSON.stringify(originalTweet)
                }).then((data) => {
                  client.post('statuses/update', {
                    in_reply_to_status_id: tweetID,
                    status: `@${username} All set! Check out: vbotcito.com/user/${username}`,
                    auto_populate_reply_metadata: true
                  }, (err, data, response) => {
                    /* console.log(`Replied to tweet: ${tweetID}`, JSON.stringify(data), err); */
                  });
                });
              }
            }
          }
        }
      });
    });

    stream.on('error', function(error) {
      console.log(error);
    });
  });
}, 0);

function interpreterTweet(date) {
  console.log("Date", date);
  return date;
}