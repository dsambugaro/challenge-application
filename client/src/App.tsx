import { FC, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import { connect } from 'react-redux';

import { WithUserProps } from './commons';
import { axiosSetup } from './utils';
import { RootState } from './store';
import { checkAuthentication } from './redux/userRedux';
import { Layout, Login } from './containers';
import { SecurityRoute } from './components';
import './App.css';

axiosSetup('https://challenge-application.herokuapp.com');

interface AppProps extends WithUserProps {
  checkAuthenticationConnect: () => void;
}

const App: FC<AppProps> = ({ user, checkAuthenticationConnect }: AppProps) => {
  useEffect(() => {
    checkAuthenticationConnect();
  }, []); // eslint-disable-line

  const app = user && user.token !== undefined && (
    <Router>
      <Switch>
        <Route
          exact
          path='/'
          render={() => <Redirect to='/challenge/dashboard' push={true} />}
        />
        <Route path='/login' component={Login} />
        <SecurityRoute path='/challenge' component={Layout} />
        <Route path='*' render={() => <Redirect to='/login' push={true} />} />
      </Switch>
    </Router>
  );

  return <div className='App'>{app}</div>;
};

const mapStateToProps = (state: RootState) => ({
  user: state.user,
});

const mapDispatchToProps = {
  checkAuthenticationConnect: checkAuthentication,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
