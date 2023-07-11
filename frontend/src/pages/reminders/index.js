/* eslint-disable */

import React, { useState, useCallback, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import _ from 'lodash';
import moment from 'moment';
import 'moment/locale/es';
import {
  message,
  Card
} from 'antd';
import axios from 'axios';

import 'antd/dist/antd.css'; // Import antd

import Layout from '../../components/Layout'
import { SERVER_API_URL } from '../../services';
import { Router, useParams } from 'react-router';

const RemindersList = (props) => {
  const params = useParams();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [reminders, setReminders] = useState({});

  useEffect(() => {
    setLoading(true);
    axios.get(`${SERVER_API_URL}/reminders/${params.private_code}`)
    .then((response) => {
      const { data } = response;
      if(data.success) {
        let grouppedBy = {
          today: {
            label: 'Hoy',
            reminders: []
          },
          this_week: {
            label: 'Esta semana',
            reminders: []
          },
          future: {
            label: 'En un futuro',
            reminders: []
          }
        };

        // Group by today, this week and futures
        if(data.reminders && data.reminders.length > 0) {
          const reminders = data.reminders;

          const today = moment();
          const tomorrow = moment().add(1, 'day');
          const nextWeek = moment().add(1, 'week');
          tomorrow.set({ hour: 0, minute: 0 });
          nextWeek.set({ hour: 23, minute: 59 });

          // Separate and group them
          grouppedBy['today'].reminders = _.filter(reminders, (i) => moment(i.reminder_at).isSame(moment(), 'day'));
          grouppedBy['this_week'].reminders = _.filter(reminders, (i) => {
            if(moment(i.reminder_at) >= tomorrow && moment(i.reminder_at) < nextWeek)
              return i;
            return null;
          });
          grouppedBy['future'].reminders = _.filter(reminders, (i) => {
            if(moment(i.reminder_at) >= nextWeek)
              return i;
            return null;
          });
        }

        setReminders(grouppedBy);
      }

      setLoading(false);
      /* const { data } = response;
      if(data.success){
        setVideos(data.videos);
      }

      setLoading(false); */
    });
  }, []);

  return (
    <Layout loading={loading}>
      <section id="reminders-list" style={{ padding: 20 }}>
        <a href="/" className="logo mr-auto"><img src="/assets/img/logo.png" alt="" className="img-fluid" /></a>

        <h1 style={{ marginTop: 10 }}>Tus recordatorios <img src={'https://www.flaticon.com/svg/static/icons/svg/817/817610.svg'} style={{ maxWidth: 30, marginLeft: 5 }} /></h1>
        <p style={{ fontWeight: 200 }}>Encontrá los recordatorios que le enviaste a <a href="https://twitter.com/vbotcito" target="_blank">vbotcito</a> a través del Whatsapp <img src={'https://www.flaticon.com/svg/static/icons/svg/1051/1051272.svg'} style={{ maxWidth: 15, marginLeft: 10 }} /></p>

        { reminders != null && Object.keys(reminders).map((e) => {
          const periodId = e;
          const reminderObject = reminders[e];

          return (
            <div style={{ marginBottom: 20 }}>
              <h5 style={{ fontWeight: 'bold' }}>{ reminderObject.label }</h5>

              { reminderObject.reminders.length == 0 &&
                <p style={{ fontWeight: 'lighter' }}>Aún no hay recordatorios para este período.</p>
              }

              { reminderObject.reminders.length > 0 && reminderObject.reminders.map((e) => {
                return (
                  <div className={`reminder_box ${periodId}`}>
                    <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>

                      <div style={{ display: 'flex', flex: 1, alignItems: 'center', marginBottom: 15 }}>
                        <img
                          src={'https://www.flaticon.com/svg/static/icons/svg/338/338903.svg'}
                          style={{ maxWidth: 17, marginRight: 5 }}
                        />
                        <p style={{ fontWeight: 'bold', margin: 0 }}>{ e.id }</p>
                      </div>

                      <div style={{ display: 'flex', flex: 1, alignItems: 'center', marginBottom: 15 }}>
                        <img
                          src={'https://www.flaticon.com/svg/static/icons/svg/930/930206.svg'}
                          style={{ maxWidth: 17, marginRight: 5 }}
                        />
                        <p style={{ fontWeight: 'bold', margin: 0 }}>{ e.text }</p>
                      </div>

                      <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
                        <img
                          src={'https://www.flaticon.com/svg/static/icons/svg/833/833593.svg'}
                          style={{ maxWidth: 17, marginRight: 5 }}
                        />
                        <p style={{ fontWeight: 'lighter', margin: 0 }}><span style={{ color: 'blue' }}> { moment(e.reminder_at).fromNow() }</span> - { moment(e.reminder_at).format('ddd MM [del] YYYY, HH:mm') }</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          );
        })}
      </section>
    </Layout>
  );
}

export default RemindersList;