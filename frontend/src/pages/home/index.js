/* eslint-disable */

import React, { useState, useCallback, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import _ from 'lodash';
import moment from 'moment';
import {
  message
} from 'antd';
import axios from 'axios';
import VideoItemPreview from '../../components/video_item_preview';
import TweetItemPreview from '../../components/tweet_item_preview';
import StickerItemPreview from '../../components/sticker_item_preview';
import qs from 'qs';

import 'antd/dist/antd.css'; // Import antd

import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

import Layout from '../../components/Layout'
import { SERVER_API_URL } from '../../services';
import { Router, useParams } from 'react-router';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Home = (props) => {
  const history = useHistory();
  const params = useParams();

  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [redeemCode, setRedeemCode] = useState(null);
  const [isRedeemingCode, setReedemingCode] = React.useState(false);
  const [isRedeemSuccess, setRedeemSuccess] = React.useState(false);
  const [flaggedContent, setFlaggedContent] = useState(false);
  const [noPublicContent, setNoPublicContent] = useState(false);

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [content, setContent] = useState({
    items: []
  });

  const onRedeem = () => {
    setReedemingCode(true)

    if(redeemCode) {
      setReedemingCode(true);
      axios.get(`${SERVER_API_URL}/redeems/code/${redeemCode}`)
      .then((response) => {
        setRedeemSuccess(true);
      }).catch((err) => {
        setRedeemSuccess(true);
      });
    }
  }

  const searchByUsername = () => {
    setLoading(true);
    history.push(`/user/${username}`)
  }

  useEffect(() => {

    let params = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    if(params.redeem) {
      // setRedeemCode(params.redeem);

      // Check if redeem exists
      axios.get(`${SERVER_API_URL}/redeems/code/${params.redeem}/exists`)
      .then((response) => {
        const { data } = response;
        if(data.success) {
          if(data.exists) {
            setRedeemCode(params.redeem);
          }
        }
      }).catch((err) => {
        setRedeemCode(null);
      });
    }

    setLoading(true);
    axios.get(`${SERVER_API_URL}/redeems/last_content?limit=6&page=${page}`)
    .then((response) => {
      const { data } = response;
      if(data.success){
        setContent(data.content);
      }

      setLoading(false);
    }).catch((err) => {
      setLoading(false);
    });
  }, []);

  const onLoadMore = (paginationPage) => {
    setLoading(true);
    axios.get(`${SERVER_API_URL}/redeems/last_content?limit=6&page=${paginationPage}`)
    .then((response) => {
      const { data } = response;
      if(data.success){
        let contentCopy = _.clone(content);
        contentCopy.items = contentCopy.items.concat(data.content.items)
        setContent(contentCopy);
        /* const newContent = content.items.concat(data.concat);
        setContent(newContent); */
      }

      setLoading(false);
    }).catch((err) => {
      setLoading(false);
    });
  }
  
  const howItWorks = () => {
    setOpen(true)
  }

  return (
    <Layout loading={loading}>
      <section className="container home" style={{ padding: 20 }}>

        {/* <p className="text-center w-100" style={{ color: 'rgba(0,0,0,.1) '}}>Publicidad</p>
        <iframe src="//rcm-na.amazon-adsystem.com/e/cm?o=1&p=13&l=ez&f=ifr&linkID=88b526d9d0ced01422a8fbbdb9916d9e&t=vbotcito30-20&tracking_id=vbotcito30-20" width="468" height="60" scrolling="no" style={{ border: 'none' }}></iframe> */}

        <a href="/" className="logo mr-auto"><img src="/assets/img/logo.png" alt="" className="img-fluid" /></a>

        { false && redeemCode == null &&
          <div className="form home" style={{ width: '100%', marginTop: 30, marginBottom: 30 }}>
            <input
              type="text"
              name="user"
              placeholder="Tu usuario de Twitter. Ejemplo: @vbotcito"
              onChange={(evt) => {
                setUsername(evt.target.value);
              }}></input>
            <input
              type="submit"
              value="Ver contenido"
              onClick={searchByUsername}
            />
          </div>
        }

        <div style={{ textAlign: 'center', padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ display: 'flex', margin: 0, justifyContent: 'center', alignItems: 'center' }}>
            ¡Seguime en Twitter!
            <img src="https://www.flaticon.com/svg/static/icons/svg/1409/1409937.svg" style={{ maxWidth: 40, marginLeft: 10 }} />
          </p>
          <a style={{ fontWeight: '800' }} target="_blank" href="https://twitter.com/eabuslaiman_">@eabuslaiman_</a>
        </div>

        { redeemCode != null &&
          <div className="redeem_box">
            <img src={'https://www.flaticon.com/svg/static/icons/svg/3022/3022607.svg'} style={{ maxWidth: 50, marginRight: 20 }} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              { !isRedeemingCode && [
                <p style={{ color: '#f13455', fontWeight: 900, fontSize: 25, textAlign: 'center' }}>Hola!</p>,
                <p style={{ fontWeight: 400, fontSize: 16, textAlign: 'center' }}>Haz click debajo para enviar ese contenido a tu WhatsApp</p>,
                
                <a onClick={onRedeem} style={{ color: '#ffffff', fontWeight: 800, fontSize: 16, backgroundColor: '#f13455', padding: 10, textAlign: 'center', borderRadius: 10 }}>
                  Enviar a mi WhatsApp
                </a>
              ]}

              { isRedeemingCode &&
                <div style={{ width: '100%', textAlign: 'center' }}>
                  { isRedeemSuccess ? [
                    <p style={{ margin: 0, marginBottom: 15 }}>Ya te envíe el contenido. <br />Chequea tu <b>WhatsApp</b></p>
                  ] :
                    <p style={{ margin: 0 }}>Un segundo..</p>
                  }

                  { noPublicContent == false && isRedeemSuccess && [
                    <p style={{ textAlign: 'center' }}>Este contenido aparecerá aquí debajo y todos podrán verlo, pero puedes cambiar eso</p>,
                    <a onClick={() => {
                      setLoading(true);
                      axios.post(`${SERVER_API_URL}/redeems/code/${redeemCode}/flag`, {
                        times: 2
                      })
                      .finally(() => {
                        setLoading(false); 
                        setNoPublicContent(true);
                        message.success('Tu contenido no se verá en el listado');
                      })
                    }} style={{ color: '#f13455', fontWeight: 800, fontSize: 16, padding: 10, marginTop: 15, marginBottom: 15, textDecoration: 'underline' }}>
                      No quiero que nadie vea este contenido en la web
                    </a>
                  ]}

                  { noPublicContent &&
                    <p style={{ fontWeight: 900, color: '#f13455' }}>¡No hay problema! Nadie verá este contenido en la web</p>
                  }
                  {/* <img src={'https://media2.giphy.com/media/5AETEpGyTqxO/giphy.gif'} style={{ maxHeight: 40, maxWidth: 40, margin: '10px auto' }} /> */}
                </div>
              }
            </div>
          </div>
        }

        { redeemCode == null &&
          <div style={{ width: '100%', textAlign: 'center', marginBottom: 30 }}>
            <Button
              color="primary"
              style={{ backgroundColor: '#0054ff', color: 'white' }}
              onClick={howItWorks}>
              <HelpOutlineIcon style={{ marginRight: 5 }} />
              Cómo funciona?
            </Button>
          </div>
        }

        <Divider />

        {/* <div className="text-center mb-2 mt-2">
          <h1>Buscá tus descargas de Twitter</h1>
          <p>Etiqueta a <a href="https://twitter.com/vbotcito" target="_blank">vbotcito</a> en un video de <img src="https://cdn2.iconfinder.com/data/icons/metro-uinvert-dock/256/Twitter_NEW.png" style={{ maxWidth: 20, maxHeight: 20 }} />, escribe tu nombre de usuario y te mostraré tus descargas.</p>
        </div> */}

        { content && content.items.length > 0 && [
          <h3 style={{ fontWeight: 900, marginTop: 25, marginBottom: 15 }}>Mirá el contenido que los usuarios <span className="c-primary" style={{ color: '#f5613c' }}>hacen</span></h3>,
          <p>Contenido random de los stickers / videos que cambian los usuarios</p>
        ]}

        <div className="row">
          { content && content.items.map((e) => {
            if(e.type == 'sticker') {
              return (
                <div className="col-lg-4 col-md-6 portfolio-item filter-web">
                  <StickerItemPreview
                    {...e}
                    onFlagContent={(code) => {
                      setLoading(true);
                      axios.post(`${SERVER_API_URL}/redeems/code/${code}/flag`, {
                        times: 1
                      })
                      .finally(() => {
                        setLoading(false);
                        setFlaggedContent(true);

                        // Remove this content from the list
                        _.remove(content.items, i => i.code == e.code);
                        setContent(content);
                      });
                    }}
                  />
                </div>
              )
            }
            
            return (
              <div className="col-lg-4 col-md-6 portfolio-item filter-web" style={{ paddingTop: 15 }}>
                <p className="text-center w-100" style={{ color: 'rgba(0,0,0,.1) '}}>Publicidad</p>
                <iframe src="//rcm-na.amazon-adsystem.com/e/cm?o=1&p=12&l=ez&f=ifr&linkID=cdd7fc93bf3e6c7f00ee12cf21c70fc1&t=vbotcito30-20&tracking_id=vbotcito30-20" width="300" height="250" scrolling="no" style={{ border: 'none' }}></iframe>
              </div>
            )
          })}
        </div>

        <Button
          color="primary"
          style={{ backgroundColor: '#0054ff', color: 'white', width: '100%', height: 50 }}
          onClick={() => {
            onLoadMore(page + 1);
            setPage(page + 1)
          }}>
          Ver más contenido
        </Button>

        <Dialog
          open={open}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description">
          <DialogTitle id="alert-dialog-slide-title">{"Soy VBotcito, un bot inteligente!"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Hola! Soy <b>Vbotcito</b>, un bot inteligente que puede hacer varias cosas; ¡desde generar stickers por whatsapp hasta recordarte de todo! Solo toca en el botón "Enviar WhatsApp" y envíame un WhatsApp.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              window.open("https://wa.me/5493512280624?text=hola")
            }} color="primary">
              Enviar WhatsApp
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={flaggedContent}
          TransitionComponent={Transition}
          keepMounted
          onClose={() => {
            setFlaggedContent(false)
          }}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description">
          <DialogTitle id="alert-dialog-slide-title">{"Reportar contenido"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src="https://www.flaticon.com/svg/static/icons/svg/825/825205.svg" style={{ width: 40, height: 40}} />
                <p style={{ marginLeft: 10, fontWeight: 600 }}>Gracias por reportar este contenido. Ya lo estamos verificando y será borrado en unos momentos</p>
              </div>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setFlaggedContent(false);
            }} color="primary">
              Aceptar
            </Button>
          </DialogActions>
        </Dialog>

        {/* <a href="#about" className="btn-get-started scrollto">Get Started</a> */}
      </section>
    </Layout>
  );
}

export default Home;