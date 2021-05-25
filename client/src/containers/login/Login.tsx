import { FC, useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Button, Card, Form, Input, Image, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios, { AxiosResponse } from 'axios';
import { connect } from 'react-redux';

import './Login.css';
import { User, WithUserProps } from '../../commons';
import { RootState } from '../../store';
import { endPoints } from '../../services';
import { login } from '../../redux/userRedux';

interface LoginProps extends WithUserProps {
  loginConnect: (user: User) => void;
}

const Login: FC<LoginProps> = ({ user, loginConnect }: LoginProps) => {
  const [isLogging, setIsLogging] = useState(false);
  const [alertProps, setAlert] = useState({ type: undefined, msg: undefined });
  const [form] = Form.useForm();
  const history = useHistory();
  const { Title } = Typography;

  useEffect(() => {
    if (user && user.token) {
      history.push('/dashboard');
    }
  });

  const onFinish = (values: Record<string, string>) => {
    setIsLogging(true);
    axios
      .request(endPoints.login(values.username, values.password))
      .then((response: AxiosResponse<User>) => {
        if (response && response.status === 200) {
          const user = response.data;
          loginConnect(user);
          setIsLogging(false);
          history.push('/dashboard');
        }
      })
      .catch(error => {
        let msg = `${error}`;
        if (error.response) {
          if (error.response.status === 401) {
            msg = 'username or password incorrect';
          } else {
            msg = error.response.data;
          }
        }
        setIsLogging(false);
        setAlert({
          type: 'error',
          msg: msg,
        });
      });
  };

  return (
    <div className='card-wrapper text-center'>
      <Card className='card'>
        {alertProps.type && alertProps.msg && (
          <Alert
            message={alertProps.msg}
            type={alertProps.type}
            showIcon
            closable
          />
        )}
        <div className='form-wrapper'>
          <div>
            <Image
              preview={false}
              width='50%'
              src='/logo192.png'
              alt='challenge logo'
            />
            <Title level={2}>CHALLENGE</Title>
          </div>
          <Form
            name='login'
            layout='vertical'
            requiredMark={false}
            onFinish={onFinish}
            scrollToFirstError
            size='large'
            form={form}
          >
            <Form.Item
              name='username'
              rules={[
                { required: true, message: 'Please input your Username!' },
              ]}
            >
              <Input
                disabled={isLogging}
                prefix={<UserOutlined className='site-form-item-icon' />}
                placeholder='Username or E-mail'
              />
            </Form.Item>
            <Form.Item
              name='password'
              rules={[
                { required: true, message: 'Please input your Password!' },
              ]}
            >
              <Input.Password
                disabled={isLogging}
                prefix={<LockOutlined className='site-form-item-icon' />}
                placeholder='Password'
              />
            </Form.Item>
            <Form.Item shouldUpdate>
              {() => (
                <Button
                  type='primary'
                  htmlType='submit'
                  loading={isLogging}
                  disabled={
                    !form.isFieldsTouched(true) ||
                    !!form
                      .getFieldsError()
                      .filter(({ errors }) => errors.length).length
                  }
                >
                  Login
                </Button>
              )}
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
};
const mapStateToProps = (state: RootState) => ({
  user: state.user,
});

const mapDispatchToProps = {
  loginConnect: login,
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
