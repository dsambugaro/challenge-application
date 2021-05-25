import { FC, useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import { Form, Input, Button, Switch, Row, Col, Space, Popconfirm } from 'antd';
import {
  SaveOutlined,
  StopOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';

import { resources, endPoints } from '../../services';
import { openNotification } from '../../utils';
import { BaseForm } from '../../components';
import { Company } from '../../commons';

import './CompanyForm.css';

interface RouteParams {
  id: string;
}

const CompanyForm: FC = () => {
  const [form] = Form.useForm();
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [company, setCompany] = useState<Company>({
    name: '',
    description: '',
    cnpj: '',
    active: true,
  });

  useEffect(() => {
    setIsLoading(true);
    axios
      .request(endPoints.get(resources.COMPANIES, undefined, undefined, id))
      .then((response: AxiosResponse<Company>) => {
        if (response && response.status === 200) {
          const data = response.data;
          if (data && Object.keys(data).length) {
            setIsNew(false);
            setCompany(response.data);
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

  const onGoBack = () => history.push('/companies');

  const onDelete = () => {
    axios
      .request(endPoints.delete(resources.COMPANIES, id))
      .then((response: AxiosResponse) => {
        if (response && response.status === 200) {
          setIsSaving(false);
          openNotification(
            { message: 'Company deleted!', duration: 5 },
            'info',
          );
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
      .request(endPoints.put(resources.COMPANIES, values))
      .then((response: AxiosResponse) => {
        if (response && response.status === 201) {
          setIsSaving(false);
          openNotification(
            { message: 'Company Created!', duration: 5 },
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
      .request(endPoints.post(resources.COMPANIES, values, id))
      .then((response: AxiosResponse) => {
        if (response && response.status === 200) {
          setIsSaving(false);
          openNotification(
            { message: 'Company Updated!', duration: 5 },
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
        name='Company'
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
              initialValue={company.name}
              rules={[
                { required: true, message: 'Please input Company name!' },
              ]}
            >
              <Input disabled={isSaving} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label='Description'
              name='description'
              initialValue={company.description}
              required={false}
            >
              <Input disabled={isSaving} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label='CNPJ'
              name='cnpj'
              initialValue={company.cnpj}
              rules={[
                { required: true, message: 'Please input Company CNPJ!' },
              ]}
            >
              <Input disabled={isSaving} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              initialValue={company.active}
              name='active'
              label='Active'
              valuePropName='checked'
            >
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
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

export default CompanyForm;
