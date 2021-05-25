import { FC, useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import { Form, Input, Button, Select, Row, Col, Space, Popconfirm } from 'antd';
import { SaveOutlined, StopOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';

import { resources, endPoints } from '../../services';
import { openNotification } from '../../utils';
import { BaseForm } from '../../components';
import { User, UserRole, WithUserProps } from '../../commons';
import { RootState } from '../../store';

import './UserForm.css';

interface RouteParams {
  id: string;
}

const UserForm: FC<WithUserProps> = (props: WithUserProps) => {
  const [form] = Form.useForm();
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [user, setUser] = useState<User>({
    name: '',
    username: '',
    email: '',
    role: UserRole.EMPLOYEE,
    company:
      props.user.role === UserRole.ADMIN ? undefined : props.user.company,
  });

  useEffect(() => {
    setIsLoading(true);
    axios
      .request(endPoints.get(resources.USERS, undefined, undefined, id))
      .then((response: AxiosResponse<User>) => {
        if (response && response.status === 200) {
          const data = response.data;
          if (data && Object.keys(data).length) {
            setIsNew(false);
            setUser(response.data);
            form.resetFields();
          } else {
            setIsNew(true);
          }
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsNew(true);
        setIsLoading(false);
      });
  }, [form, id]);

  const onGoBack = () => history.push('/users');

  const onDelete = () => {
    axios
      .request(endPoints.delete(resources.USERS, id))
      .then((response: AxiosResponse) => {
        if (response && response.status === 200) {
          setIsSaving(false);
          openNotification({ message: 'User deleted!', duration: 5 }, 'info');
          onGoBack();
        }
      })
      .catch(error => {
        setIsSaving(false);
        openNotification({ message: `${error}` }, 'error');
      });
  };

  const onAddNew = (values: Record<string, string>) => {
    setIsSaving(true);
    axios
      .request(endPoints.put(resources.USERS, values))
      .then((response: AxiosResponse) => {
        if (response && response.status === 201) {
          setIsSaving(false);
          openNotification(
            { message: 'User Created!', duration: 5 },
            'success',
          );
          onGoBack();
        }
      })
      .catch(error => {
        setIsSaving(false);
        openNotification({ message: `${error}` }, 'error');
      });
  };

  const onUpdate = (values: Record<string, string>) => {
    setIsSaving(true);
    axios
      .request(endPoints.post(resources.USERS, values, id))
      .then((response: AxiosResponse) => {
        if (response && response.status === 200) {
          setIsSaving(false);
          openNotification(
            { message: 'User Updated!', duration: 5 },
            'success',
          );
          onGoBack();
        }
      })
      .catch(error => {
        setIsSaving(false);
        openNotification({ message: `${error}` }, 'error');
      });
  };

  return (
    <>
      <BaseForm
        form={form}
        name='User'
        isNew={isNew}
        isLoading={isLoading}
        onAddNew={onAddNew}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onGoBack={onGoBack}
      >
        <Row>
          <Col span={12}>
            <Form.Item
              label='Name'
              name='name'
              initialValue={user.name}
              rules={[{ required: true, message: 'Please input User name!' }]}
            >
              <Input disabled={isSaving} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label='E-mail'
              name='email'
              initialValue={user.username}
              rules={[
                {
                  required: true,
                  type: 'email',
                  message: 'Please input valid User E-mail!',
                },
              ]}
            >
              <Input disabled={isSaving} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              initialValue={user.role}
              name='role'
              label='Role'
              rules={[{ required: true, message: 'Please select User role!' }]}
            >
              <Select value={user.role} disabled={isSaving}>
                {props.user.role === UserRole.ADMIN && (
                  <Select.Option value={UserRole.ADMIN}>Admin</Select.Option>
                )}
                <Select.Option value={UserRole.MANAGER}>Manager</Select.Option>
                <Select.Option value={UserRole.EMPLOYEE}>
                  Employee
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label='Username'
              name='username'
              initialValue={user.username}
              rules={[
                { required: true, message: 'Please input User username!' },
              ]}
            >
              <Input disabled={isSaving} />
            </Form.Item>
          </Col>
        </Row>
        {isNew && (
          <Row>
            <Col span={12}>
              <Form.Item
                label='Password'
                name='password'
                initialValue={user.password}
                rules={[
                  { required: true, message: 'Please input User password!' },
                ]}
              >
                <Input.Password disabled={isSaving} />
              </Form.Item>
            </Col>
          </Row>
        )}
        <Row>
          <Col span={12}>
            <Form.Item
              label='Company'
              name='company'
              initialValue={user.company}
              required={false}
            >
              <Input
                type='number'
                min={1}
                disabled={isSaving || props.user.role !== UserRole.ADMIN}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item shouldUpdate>
          {() => (
            <>
              <Row justify='end'>
                <Space>
                  <Col>
                    <Button
                      type='primary'
                      icon={<SaveOutlined />}
                      htmlType='submit'
                      loading={isSaving}
                    >
                      Save
                    </Button>
                  </Col>
                  <Col>
                    <Popconfirm
                      placement='top'
                      title={'Are you sure to cancel this?'}
                      onConfirm={onGoBack}
                      okText='Yes, cancel'
                      cancelText='No'
                    >
                      <Button
                        danger
                        icon={<StopOutlined />}
                        htmlType='button'
                        loading={isSaving}
                      >
                        Cancel
                      </Button>
                    </Popconfirm>
                  </Col>
                </Space>
              </Row>
            </>
          )}
        </Form.Item>
      </BaseForm>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  user: state.user,
});

export default connect(mapStateToProps)(UserForm);
