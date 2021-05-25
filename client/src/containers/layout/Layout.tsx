import React, { FC, useState } from 'react';
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import { Layout, Menu, Row, Col, Typography, Image } from 'antd';
import {
  BankOutlined,
  GoldOutlined,
  TeamOutlined,
  TagsOutlined,
  MenuFoldOutlined,
  AreaChartOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { connect } from 'react-redux';

import './Layout.css';
import {
  UnitView,
  UnitForm,
  UserView,
  UserForm,
  AssetView,
  AssetForm,
  CompanyView,
  CompanyForm,
  DashboardView,
} from '../';
import { RootState } from '../../store';
import { SecurityRoute, UserActions } from '../../components';
import { WithUserProps, UserRole } from '../../commons';

const items = [
  {
    icon: <AreaChartOutlined />,
    path: '/dashboard',
    label: 'Dashboard',
  },
  {
    icon: <BankOutlined />,
    path: '/companies',
    label: 'Companies',
    blackList: [UserRole.EMPLOYEE],
  },
  {
    icon: <GoldOutlined />,
    path: '/units',
    label: 'Units',
    blackList: [UserRole.EMPLOYEE],
  },
  {
    icon: <TeamOutlined />,
    path: '/users',
    label: 'Users',
    blackList: [UserRole.EMPLOYEE],
  },
  {
    icon: <TagsOutlined />,
    path: '/assets',
    label: 'Assets',
  },
];

const MainLayout: FC<WithUserProps> = ({ user }: WithUserProps) => {
  const [collapsed, setcollapsed] = useState(false);

  const { Header, Sider, Content } = Layout;
  const { Title } = Typography;

  React.useEffect(() => { }, []); // eslint-disable-line

  const toggle = () => {
    setcollapsed(!collapsed);
  };

  return (
    <Layout className='layout'>
      <Sider breakpoint='sm' trigger={null} collapsible collapsed={collapsed}>
        <div className='logo-wrapper text-center'>
          <Image
            className='logo'
            preview={false}
            src='/logo192.png'
            alt='challenge logo'
          />
        </div>
        <Menu
          theme='dark'
          mode='inline'
          defaultSelectedKeys={[`/${window.location.pathname.split('/')[1]}`]}
        >
          {items.map(item => {
            if (
              !item.icon ||
              (item.blackList && item.blackList.includes(user.role))
            ) {
              return null;
            }
            return (
              <Menu.Item key={item.path} icon={item.icon}>
                <Link to={item.path}>
                  <span>{item.label}</span>
                </Link>
              </Menu.Item>
            );
          })}
        </Menu>
      </Sider>
      <Layout className='site-layout'>
        <Header
          className='header site-layout-background'
          style={{ padding: 0 }}
        >
          <Row justify='space-around' align='middle'>
            <Col span={8}>
              {React.createElement(
                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                {
                  className: 'trigger',
                  onClick: toggle,
                },
              )}
            </Col>
            <Col span={8}>
              <div className='brand'>
                <Title level={3}>CHALLENGE</Title>
              </div>
            </Col>
            <Col span={8}>
              <UserActions />
            </Col>
          </Row>
        </Header>
        <Content
          className='site-layout-background'
          style={{
            margin: '24px 16px',
            padding: 24,
            height: 'calc(100vh - 64px)',
            overflow: 'auto',
          }}
        >
          <Switch>
            <SecurityRoute path={'/dashboard'} component={DashboardView} />
            <SecurityRoute exact path={'/assets'} component={AssetView} />
            <SecurityRoute path={'/assets/:id'} component={AssetForm} />
            {user.role !== UserRole.EMPLOYEE && ( // Routes that emplayee don't have access
              <>
                <SecurityRoute
                  exact
                  path={'/companies'}
                  component={CompanyView}
                />
                <SecurityRoute
                  path={'/companies/:id'}
                  component={CompanyForm}
                />
                <SecurityRoute exact path={'/units'} component={UnitView} />
                <SecurityRoute path={'/units/:id'} component={UnitForm} />
                <SecurityRoute exact path={'/users'} component={UserView} />
                <SecurityRoute path={'/users/:id'} component={UserForm} />
              </>
            )}
            <Route
              path='/*'
              render={() => <Redirect to='/dashboard' push={true} />}
            />
          </Switch>
        </Content>
      </Layout>
    </Layout>
  );
};

const mapStateToProps = (state: RootState) => ({
  user: state.user,
});

export default connect(mapStateToProps)(MainLayout);
