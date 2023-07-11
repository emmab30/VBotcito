/* eslint-disable */

import React, { useState, useCallback, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import _ from 'lodash';
import moment from 'moment';
import {
  message
} from 'antd';
import axios from 'axios';

import 'antd/dist/antd.css'; // Import antd

import Layout from '../../components/Layout'
import { SERVER_API_URL } from '../../services';
import { Router, useParams } from 'react-router';

const RedeemCode = (props) => {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    axios.get(`${SERVER_API_URL}/redeem/${params.code}`)
    .then((response) => {
      setLoading(false);
    }).catch((err) => {
      setLoading(false);
    });
  }, []);

  return (
    <Layout loading={loading}>
      <section id="hero" className="d-flex align-items-center">
        <div
          className="container d-flex flex-column align-items-center justify-content-center">
          <a href="/" className="logo mr-auto"><img src="assets/img/logo.png" alt="" className="img-fluid" /></a>

          <h1>¡Listo!</h1>
          <h2 style={{ width: '100%', marginBottom: 15 }}>Te envíe el contenido a tu número de WhatsApp <img src={'https://www.flaticon.com/svg/static/icons/svg/1051/1051272.svg'} style={{ maxWidth: 30, marginLeft: 10 }} /></h2>
          <h4><b>¡Disfrútalo!</b></h4>
        </div>
      </section>
    </Layout>
  );
}

export default RedeemCode;