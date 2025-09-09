import React from 'react';
import Layout from '../components/Layout';
import { Switch, Route } from 'react-router-dom';
import Exchange from '../pages/exchange';
import Markets from '../pages/markets';
import Profile from './profile';
import Wallet from './wallet';
import Settings from './settings';
import Login from './login';
import Reset from './reset';
import OtpVerify from './otp-verify';
import OtpNumber from './otp-number';
import Lock from './lock';
import TermsAndConditions from './terms-and-conditions';
import NewsDetails from './news-details';
import Signup from './signup';
import Notfound from './notfound';
import Auth from './auth';
import DevOrdersTest from './DevOrdersTest';

export default function index() {
  return (
    <>
      <Layout>
        <Switch>
          <Route exact path="/" component={Exchange} />
          <Route path="/auth" component={Auth} />
          <Route path="/markets" component={Markets} />
          <Route component={Notfound} />
          <Route path="/dev-orders" component={DevOrdersTest} />
        </Switch>
      </Layout>
    </>
  );
}
