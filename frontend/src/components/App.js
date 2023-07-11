/* eslint-disable */

import React from 'react';
import _ from 'lodash';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import 'antd/dist/antd.css'; // Import antd

// Components
import Home from '../pages/home';
import UserContentList from '../pages/user';
import RemindersList from '../pages/reminders'
import RedeemThing from '../pages/redeem';
import { createMuiTheme } from '@material-ui/core/styles';


export default class App extends React.Component {
  
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <Router>
      <Switch>
      <Route
      exact
      path='/'
      component={Home}
      />
      
      
      <Route
      path='/user/:username'
      component={UserContentList}
      />
      
      <Route
      path='/reminders/:private_code'
      component={RemindersList}
      />
      
      <Route
      path='/redeem/:code'
      component={RedeemThing}
      />
      </Switch>
      </Router>
      );
    }
  }