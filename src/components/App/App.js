import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Header from '../Header/Header';
import PrivateRoute from '../PrivateRoute/PrivateRoute';
import PublicOnlyRoute from '../PublicOnlyRoute/PublicOnlyRoute';
import RegistrationRoute from '../../routes/RegistrationRoute/RegistrationRoute';
import LoginRoute from '../../routes/LoginRoute/LoginRoute';
import DashboardRoute from '../../routes/DashboardRoute/DashboardRoute';
import NotFoundRoute from '../../routes/NotFoundRoute/NotFoundRoute';
import ProfileRoute from '../../routes/ProfileRoute/ProfileRoute'
import LogHomeRoute from '../../routes/LogHomeRoute/LogHomeRoute';
import LogMealRoute from '../../routes/LogMealRoute/LogMealRoute';
import LogSnackRoute from '../../routes/LogSnackRoute/LogSnackRoute';
import MealDetailsRoute from '../../routes/MealDetailsRoute/MealDetailsRoute';
import MealsRoute from '../../routes/MealsRoute/MealsRoute';
import AboutRoute from '../../routes/AboutRoute/AboutRoute';
import './App.css';
import Loading from '../Loading/Loading';
import ChartRoute from '../../routes/ChartRoute/ChartRoute';

import './Light.css'

if (false) {
  require('./Dark.css');
}

export default class App extends Component {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError(error) {
    console.error(error);
    return {
      hasError: true
    };
  }

  render() {
    const { hasError } = this.state;

    return (
      <div className='App'>
        <Header />
        <main>
          {hasError && (
            <p>There was an error! Oh no!</p>
          )}
          <Switch>
            <PrivateRoute
              exact
              path={'/'}
              component={DashboardRoute}
            />
            <PrivateRoute
              exact path={'/meals'}
              component={MealsRoute}
            />
            <PrivateRoute
              path={'/meals/:meal_id'}
              component={MealDetailsRoute}
            />
            <PrivateRoute
              path={'/log'}
              component={LogHomeRoute}
            />
            <PrivateRoute
              path={'/logmeal'}
              component={LogMealRoute}
            />
            <PrivateRoute
              path={'/logsnack'}
              component={LogSnackRoute}
            />
            <PrivateRoute
              path={'/profile'}
              component={ProfileRoute}
            />
            <PrivateRoute
              path={'/charts'}
              component={ChartRoute}
            />
            <PublicOnlyRoute
              path={'/register'}
              component={RegistrationRoute}
            />
            <PublicOnlyRoute
              path={'/login'}
              component={LoginRoute}
            />
            <PublicOnlyRoute
              path={'/about'}
              component={AboutRoute}
            />
            <Route 
              path={'/loading'}
              component = {Loading}
            />
            <Route
              component={NotFoundRoute}
            />
          </Switch>
        </main>
      </div>
    );
  }
}