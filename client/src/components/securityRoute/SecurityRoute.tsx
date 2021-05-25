import { FC } from 'react';
import { RouteProps } from 'react-router';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { WithUserProps } from '../../commons';
import { RootState } from '../../store';

interface SecurityRouteProps extends RouteProps, WithUserProps {}

const SecurityRoute: FC<SecurityRouteProps> = ({
  component,
  user,
  ...rest
}: SecurityRouteProps) => {
  return user && user.token ? (
    <Route {...rest} component={component} />
  ) : (
    <Redirect to={{ pathname: '/login' }} />
  );
};

const mapStateToProps = (state: RootState) => ({
  user: state.user,
});

export default connect(mapStateToProps)(SecurityRoute);
