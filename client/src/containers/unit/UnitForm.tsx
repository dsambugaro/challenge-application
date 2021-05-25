import { FC, useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import { Form, Input, Button, Row, Col, Space, Popconfirm } from 'antd';
import { SaveOutlined, StopOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';

import { resources, endPoints } from '../../services';
import { openNotification } from '../../utils';
import { BaseForm } from '../../components';
import { Unit, WithUserProps, UserRole } from '../../commons';
import { RootState } from '../../store';

import './UnitForm.css';

interface RouteParams {
  id: string;
}

const UnitForm: FC<WithUserProps> = ({ user }: WithUserProps) => {
  const [form] = Form.useForm();
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [unit, setUnit] = useState<Unit>({
    name: '',
    company: user.role === UserRole.ADMIN ? undefined : user.company,
  });

  useEffect(() => {
    setIsLoading(true);
    axios
      .request(endPoints.get(resources.UNITS, undefined, undefined, id))
      .then((response: AxiosResponse<Unit>) => {
        if (response && response.status === 200) {
          const data = response.data;
          if (data && Object.keys(data).length) {
            setIsNew(false);
            setUnit(response.data);
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

  const onGoBack = () => history.push('/units');

  const onDelete = () => {
    axios
      .request(endPoints.delete(resources.UNITS, id))
      .then((response: AxiosResponse) => {
        if (response && response.status === 200) {
          setIsSaving(false);
          openNotification({ message: 'Unit deleted!', duration: 5 }, 'info');
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
      .request(endPoints.put(resources.UNITS, values))
      .then((response: AxiosResponse) => {
        if (response && response.status === 201) {
          setIsSaving(false);
          openNotification(
            { message: 'Unit Created!', duration: 5 },
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
      .request(endPoints.post(resources.UNITS, values, id))
      .then((response: AxiosResponse) => {
        if (response && response.status === 200) {
          setIsSaving(false);
          openNotification(
            { message: 'Unit Updated!', duration: 5 },
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
        name='Unit'
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
              initialValue={unit.name}
              rules={[{ required: true, message: 'Please input Unit name!' }]}
            >
              <Input disabled={isSaving} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label='Company'
              name='company'
              initialValue={unit.company}
              rules={[
                {
                  required: true,
                  type: 'number',
                  min: 0,
                  message: 'Please input Unit Company!',
                },
              ]}
            >
              <Input
                type='number'
                min={1}
                disabled={isSaving || user.role !== UserRole.ADMIN}
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

export default connect(mapStateToProps)(UnitForm);
