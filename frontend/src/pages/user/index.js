/* eslint-disable */

import React, { useState, useCallback, useEffect } from 'react';
import _ from 'lodash';
import moment from 'moment';
import {
  message,
  Alert
} from 'antd';
import axios from 'axios';

import 'antd/dist/antd.css'; // Import antd

import Layout from '../../components/Layout'
import VideoItemPreview from '../../components/video_item_preview';
import TweetItemPreview from '../../components/tweet_item_preview'
import { SERVER_API_URL } from '../../services';
import { useParams } from 'react-router';

const DownloadsList = (props) => {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    setUsername(params.username);
    axios.get(`${SERVER_API_URL}/twitter_content/${params.username}`)
    .then((response) => {
      const { data } = response;
      if(data.success){
        setVideos(data.videos);
      }

      setLoading(false);
    });
  }, []);

  return (
    <Layout
      seo={{
        title: 'Your profile in vbotcito'
      }}
      loading={loading}>
      <section className="container">
        <a href="/" className="logo mr-auto" style={{ marginTop: 20, display: 'block', marginBottom: 15 }}><img src="/assets/img/logo.png" alt="" className="img-fluid" style={{ maxWidth: 40 }} /></a>

        <h1><span style={{ color: '#3b4ef8' }}>@{ username }</span> content</h1>
        <p style={{ marginTop: 10, marginBottom: 10, fontWeight: 300 }}>This is your content</p>
        <p style={{ marginTop: 0, marginBottom: 20, fontWeight: 300 }}>If you want your own content here, remember to mention <a href="https://twitter.com/vbotcito" target="_blank" style={{ fontWeight: 800 }}>@vbotcito</a> in any tweet, and I'll save that content here for you.</p>

        <hr />

        <div className="row">
          { videos && videos.map((e) => {
            if(e.video_link && e.video_link.length) {
              return (
                <div className="col-lg-4 col-md-6 portfolio-item filter-web">
                  <VideoItemPreview
                    tweet={e}
                    onVideoChange={(playing) => {
                      // Do nothing
                    }}
                  />
                </div>
              );
            }

            return (
              <div className="col-lg-4 col-md-6 portfolio-item filter-web">
                <TweetItemPreview
                  tweet={e}
                />
              </div>
            );
          })}

          { !videos || !videos.length &&
            <Alert
              style={{ width: '100%', margin: '0 auto' }}
              type="error"
              message={
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Oops! Seems that you don't have content yet. Mention @vbotcito in any tweet then I can save that content to you</p>
              }
              banner
            />
          }
        </div>
      </section>
    </Layout>
  );
}

export default DownloadsList;