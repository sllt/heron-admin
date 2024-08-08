import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Tag,
} from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import { useEffect, useState } from 'react';

import apiService from '@/api/services/apiService';
import { IconButton, Iconify } from '@/components/icon';
import ProTag from '@/theme/antd/components/tag';

import { Api, ApiSearchFormFieldType, Response } from '#/entity';

export default function ApiPage() {
  const [searchForm] = Form.useForm();
  const queryClient = useQueryClient();

  const [queryParams, setQueryParams] = useState<ApiSearchFormFieldType>({
    title: undefined,
    path: undefined,
    action: undefined,
    page: 1,
    size: 10,
  });
  const { data, refetch } = useQuery<Response<Api[]>>({
    queryKey: ['api', queryParams],
    queryFn: () => apiService.getApiList(queryParams),
  });

  const [apiModalPros, setApiModalProps] = useState<ApiModalProps>({
    formValue: {
      id: 0,
    },
    title: '新增',
    show: false,
    onOk: () => {
      setApiModalProps((prev) => ({ ...prev, show: false }));
      refetch();
    },
    onCancel: () => {
      setApiModalProps((prev) => ({ ...prev, show: false }));
    },
    edited: false,
  });

  const onDeleteApi = async (api: Api) => {
    const ids = [api.id];
    await apiService.deleteApi(ids);
    await queryClient.invalidateQueries({ queryKey: ['api'] });
  };

  const tagColor = (action: string) => {
    switch (action) {
      case 'GET':
        return '#4CAF50';
      case 'POST':
        return '#FA8C15';
      case 'PUT':
        return '#1990FF';
      case 'DELETE':
        return '#FA531C';
      default:
        return 'default';
    }
  };

  const onPageChange = (page: number, pageSize: number) => {
    console.log(data?.meta.total);
    setQueryParams({
      ...queryParams,
      page,
      size: pageSize,
    });
  };

  const columns: ColumnsType<Api> = [
    { title: '标题', dataIndex: 'title' },
    {
      title: 'Request Info',
      dataIndex: 'path',
      width: 400,
      render: (_, record) => (
        <div className="flex w-full">
          <Tag bordered={false} color={tagColor(record.action!)}>
            {record.action}
          </Tag>
          <span className="ml-1">{record.path}</span>
        </div>
      ),
    },
    { title: '创建时间', dataIndex: 'createdAt', align: 'center', width: 300 },
    {
      title: '操作',
      key: 'operation',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <div className="flex w-full justify-center text-gray">
          <IconButton onClick={() => onEdit(record)}>
            <Iconify icon="solar:pen-bold-duotone" size={18} />
          </IconButton>
          <Popconfirm
            onConfirm={() => onDeleteApi(record)}
            title="确定删除？"
            okText="是"
            cancelText="否"
            placement="left"
          >
            <IconButton>
              <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
            </IconButton>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // rowSelection objects indicates the need for row selection
  const rowSelection: TableRowSelection<Api> = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    onSelect: (record, selected, selectedRows) => {
      console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log(selected, selectedRows, changeRows);
    },
  };

  const onSearchFormReset = async () => {
    searchForm.resetFields();
    setQueryParams({ title: undefined, path: undefined, action: undefined });
    queryClient.invalidateQueries({ queryKey: ['api'] });
  };

  const onEdit = (formValue: Api) => {
    setApiModalProps((prev) => ({
      ...prev,
      show: true,
      title: '编辑',
      edited: true,
      formValue,
    }));
  };

  const onFinish = (values: ApiSearchFormFieldType) => {
    setQueryParams(values);
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm} onFinish={onFinish}>
          <Row gutter={[16, 16]}>
            <Col span={24} lg={6}>
              <Form.Item<ApiSearchFormFieldType> label="标题" name="title" className="!mb-0">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<ApiSearchFormFieldType> label="地址" name="path" className="!mb-0">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<ApiSearchFormFieldType> label="类型" name="action" className="!mb-0">
                <Select>
                  <Select.Option value="GET">
                    <ProTag color="#4CAF50">GET</ProTag>
                  </Select.Option>
                  <Select.Option value="POST">
                    <ProTag color="#FA8C15">POST</ProTag>
                  </Select.Option>
                  <Select.Option value="PUT">
                    <ProTag color="#1990FF">PUT</ProTag>
                  </Select.Option>
                  <Select.Option value="DELETE">
                    <ProTag color="#FA531C">DELETE</ProTag>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <div className="flex justify-end">
                <Button onClick={onSearchFormReset}>重置</Button>
                <Button htmlType="submit" type="primary" className="ml-4">
                  查询
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title="接口列表">
        <Table
          rowKey="id"
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={{
            total: 100,
            onChange: (page, pageSize) => {
              onPageChange(page, pageSize);
            },
          }}
          columns={columns}
          dataSource={data?.data}
          rowSelection={{ ...rowSelection }}
        />
      </Card>

      <ApiModal {...apiModalPros} />
    </Space>
  );
}

type ApiModalProps = {
  formValue: Api;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
  edited: boolean;
};

function ApiModal({ title, show, formValue, onOk, onCancel, edited }: ApiModalProps) {
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({ ...formValue });
  }, [formValue, form]);

  const createApi = async () => {
    const values = await form.validateFields();
    if (edited) {
      const api = values as Api;
      api.id = formValue.id;
      await apiService.updateApi(api);
    } else {
      await apiService.createApi(values as Api);
    }
    onOk();
  };

  return (
    <Modal title={title} open={show} onOk={createApi} onCancel={onCancel}>
      <Form
        initialValues={formValue}
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
      >
        <Form.Item<Api> label="岗位名称" name="title" required>
          <Input />
        </Form.Item>
        <Form.Item<Api> label="岗位编码" name="path" required>
          <Input />
        </Form.Item>
        <Form.Item<Api> label="状态" name="action" required>
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio value={2}> 正常 </Radio>
            <Radio value={1}> 停用 </Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}
