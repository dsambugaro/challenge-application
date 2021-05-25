import { FC, ReactNode } from 'react';
import {
  PageHeader,
  Spin,
  Form,
  Button,
  Row,
  Col,
  Popconfirm,
  Tag,
  FormInstance,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import pluralize from 'pluralize';

import './BaseForm.css';

interface BaseFormProps {
  form: FormInstance;
  name: string;
  isNew: boolean;
  isLoading: boolean;
  onAddNew: (values: Record<string, string>) => void;
  onUpdate: (values: Record<string, string>) => void;
  onGoBack: () => void;
  onDelete: () => void;
  children?: ReactNode;
}

const BaseForm: FC<BaseFormProps> = ({
  form,
  name,
  isNew,
  isLoading,
  onAddNew,
  onUpdate,
  onGoBack,
  onDelete,
  children,
}: BaseFormProps) => {
  const pluralName = pluralize(name);
  const goBack = () => onGoBack();
  const onFinish = (values: Record<string, string>) => {
    if (isNew) {
      onAddNew(values);
    } else {
      onUpdate(values);
    }
  };

  return (
    <>
      <PageHeader
        onBack={goBack}
        className='page-header'
        title={pluralName}
        subTitle='form'
        tags={
          <Tag
            icon={isNew ? <PlusCircleOutlined /> : <EditOutlined />}
            color='processing'
          >
            {isNew ? 'Adding' : 'Editing'}
          </Tag>
        }
        extra={
          !isNew && onDelete
            ? [
                <Popconfirm
                  key='remove'
                  placement='left'
                  title={'Are you sure to delete this?'}
                  onConfirm={() => onDelete()}
                  okText={`Yes, delete ${name}`}
                  cancelText='No'
                >
                  <Row justify='end'>
                    <Col>
                      <Button danger icon={<DeleteOutlined />} />
                    </Col>
                  </Row>
                </Popconfirm>,
              ]
            : []
        }
      />
      <Spin spinning={isLoading} delay={500}>
        <Form
          labelCol={{ span: 4 }}
          name={name}
          layout='horizontal'
          requiredMark={false}
          onFinish={onFinish}
          scrollToFirstError
          size='large'
          form={form}
        >
          {children}
        </Form>
      </Spin>
    </>
  );
};

export default BaseForm;
