import { FC } from 'react';
import { connect } from 'react-redux';
import { Tooltip, Button, Avatar, Space } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

import './UserActions.css';
import { WithUserProps } from '../../commons';
import { RootState } from '../../store';
import { logout } from '../../redux/userRedux';

interface UserActionsProps extends WithUserProps {
  logoutConnect: () => void;
}

const UserActions: FC<UserActionsProps> = ({
  user,
  logoutConnect,
}: UserActionsProps) => {
  const logOut = () => {
    logoutConnect();
  };

  return (
    <div className='logout'>
      <Tooltip placement='bottom' title={user.email}>
        <Space align='center'>
          <Avatar style={{ backgroundColor: '#1890FF' }}>
            {user.name.substring(0, 2).toUpperCase()}
          </Avatar>
          {user.username}
        </Space>
      </Tooltip>
      <Tooltip placement='bottom' title={'logout'}>
        <Button
          className='logout-button'
          shape='circle'
          icon={<LogoutOutlined />}
          onClick={logOut}
        />
      </Tooltip>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  user: state.user,
});

const mapDispatchToProps = {
  logoutConnect: logout,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserActions);
