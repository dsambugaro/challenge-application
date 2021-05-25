import { FC, useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Space,
  Popconfirm,
  Radio,
  Slider,
  Upload,
  Image,
  Tooltip,
  message,
} from 'antd';
import {
  SaveOutlined,
  StopOutlined,
  UploadOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import { connect } from 'react-redux';

import { RootState } from '../../store';
import { BaseForm } from '../../components';
import { resources, endPoints } from '../../services';
import { openNotification, placeHolderImg } from '../../utils';
import { Asset, AssetStatus, WithUserProps, UserRole } from '../../commons';
import './AssetForm.css';

interface RouteParams {
  id: string;
}

const AssetForm: FC<WithUserProps> = ({ user }: WithUserProps) => {
  const [form] = Form.useForm();
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [imageBase64, setImageBase64] = useState('');
  const [asset, setAsset] = useState<Asset>({
    name: '',
    healthscore: 50,
    image: '',
    serialnumber: '',
    status: AssetStatus.IN_DOWNTIME,
    user: undefined,
    unit: undefined,
    company: user.role === UserRole.ADMIN ? undefined : user.company,
  });

  const handleUpload = (file: File) => {
    const isLessthan5M = file.size / 1024 / 1024 < 5;
    if (!isLessthan5M) {
      message.error('Image must be smaller than 5MB!', 10);
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        setImageBase64(reader.result.toString());
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
        message.error(`Error processing image: ${error}`, 15);
      };
    }
    return false;
  };

  useEffect(() => {
    setIsLoading(true);
    axios
      .request(endPoints.get(resources.ASSETS, undefined, undefined, id))
      .then((response: AxiosResponse<Asset>) => {
        if (response && response.status === 200) {
          const data = response.data;
          if (data && Object.keys(data).length) {
            setIsNew(false);
            setAsset(response.data);
            setImageBase64(response.data.image);
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
  }, []); // eslint-disable-line

  const onGoBack = () => history.push('/assets');

  const onDelete = () => {
    axios
      .request(endPoints.delete(resources.ASSETS, id))
      .then((response: AxiosResponse) => {
        if (response && response.status === 200) {
          setIsSaving(false);
          openNotification({ message: 'Asset deleted!', duration: 5 }, 'info');
          onGoBack();
        }
      })
      .catch(error => {
        setIsSaving(false);
        openNotification({ message: `${error}` }, 'error');
      });
  };

  const onAddNew = (values: Record<string, string>) => {
    const newAsset = { ...values, image: imageBase64 };
    setIsSaving(true);
    axios
      .request(endPoints.put(resources.ASSETS, newAsset))
      .then((response: AxiosResponse) => {
        if (response && response.status === 201) {
          setIsSaving(false);
          openNotification(
            { message: 'Asset Created!', duration: 5 },
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
    // Is necessary explits image this way because
    // virtual field "image", on the typegoose model
    // on the back-end isn't working properly
    const splited = imageBase64.split(',');
    const newAsset = {
      ...values,
      image: '',
      imageType: splited.length ? splited[0] : '',
      imageBuffer: splited.length ? splited[1] : '',
    };
    axios
      .request(endPoints.post(resources.ASSETS, newAsset, id))
      .then((response: AxiosResponse) => {
        if (response && response.status === 200) {
          setIsSaving(false);
          openNotification(
            { message: 'Asset Updated!', duration: 5 },
            'success',
          );
          onGoBack();
        } else {
          setIsSaving(false);
          openNotification(
            { message: 'Unable to make request to server' },
            'error',
          );
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
        name='Asset'
        isNew={isNew}
        isLoading={isLoading}
        onAddNew={onAddNew}
        onUpdate={onUpdate}
        onDelete={user.role === UserRole.EMPLOYEE ? undefined : onDelete}
        onGoBack={onGoBack}
      >
        <Row>
          <Col span={12}>
            <Form.Item
              label='Name'
              name='name'
              initialValue={asset.name}
              rules={[{ required: true, message: 'Please input Asset name!' }]}
            >
              <Input disabled={isSaving || user.role === UserRole.EMPLOYEE} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label='Serial Number'
              name='serialnumber'
              initialValue={asset.serialnumber}
              required={false}
            >
              <Input disabled={isSaving || user.role === UserRole.EMPLOYEE} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label='Company'
              name='company'
              initialValue={asset.company}
              required={false}
            >
              <Input
                type='number'
                min={1}
                disabled={isSaving || user.role !== UserRole.ADMIN}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label='Unit'
              name='unit'
              initialValue={asset.unit}
              required={false}
            >
              <Input
                type='number'
                min={1}
                disabled={isSaving || user.role === UserRole.EMPLOYEE}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label='Responsible'
              name='user'
              initialValue={asset.user}
              required={false}
            >
              <Input
                type='number'
                min={1}
                disabled={isSaving || user.role === UserRole.EMPLOYEE}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              initialValue={asset.healthscore}
              label='Health'
              name='healthscore'
            >
              <Slider
                min={0}
                max={100}
                step={0.05}
                tipFormatter={value => `${value}%`}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label='Status'
              name='status'
              initialValue={asset.status}
              rules={[{ required: true, message: 'Please select a Status!' }]}
            >
              <Radio.Group>
                <Radio.Button value={AssetStatus.IN_OPERATION}>
                  In Operation
                </Radio.Button>
                <Radio.Button value={AssetStatus.IN_ALERT}>
                  In Alert
                </Radio.Button>
                <Radio.Button value={AssetStatus.IN_DOWNTIME}>
                  In Downtime
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label='Image' name='image' extra='Max. 5 MB'>
              <Space align='start'>
                <ImgCrop rotate>
                  <Upload
                    accept='image/png, image/jpg, image/jpeg'
                    maxCount={1}
                    showUploadList={false}
                    beforeUpload={handleUpload}
                    customRequest={({ onSuccess }) => {
                      onSuccess('ok', undefined);
                    }}
                  >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </ImgCrop>
                <Image
                  width='200px'
                  src={imageBase64}
                  fallback={placeHolderImg}
                />
                {imageBase64 && (
                  <Tooltip placement='right' title='Remove image'>
                    <CloseCircleOutlined onClick={() => setImageBase64('')} />
                  </Tooltip>
                )}
              </Space>
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

export default connect(mapStateToProps)(AssetForm);
