import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
} from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import { useEffect, useState } from 'react';

import configService from '@/api/services/configService';
import { IconButton, Iconify } from '@/components/icon';
import ProTag from '@/theme/antd/components/tag';

import { Config, ConfigSearchFormFieldType, Response } from '#/entity';

export default function ConfigPage() {
  const [searchForm] = Form.useForm();
  const queryClient = useQueryClient();

  const [queryParams, setQueryParams] = useState<ConfigSearchFormFieldType>({
    configName: undefined,
    configType: undefined,
    configKey: undefined,
  });
  const { data, refetch } = useQuery<Response<Config[]>>({
    queryKey: ['config', queryParams],
    queryFn: () => configService.getConfigList(queryParams),
  });

  const [configModalPros, setConfigModalProps] = useState<ConfigModalProps>({
    formValue: {
      id: 0,
    },
    title: '新增',
    show: false,
    onOk: () => {
      setConfigModalProps((prev) => ({ ...prev, show: false }));
      refetch();
    },
    onCancel: () => {
      setConfigModalProps((prev) => ({ ...prev, show: false }));
    },
    edited: false,
  });

  const onDeleteDept = async (config: Config) => {
    // console.log(config);
    const ids = [config.id];
    await configService.deleteConfig(ids);
    await queryClient.invalidateQueries({ queryKey: ['config'] });
  };

  const columns: ColumnsType<Config> = [
    { title: '编码', dataIndex: 'id' },
    { title: '名称', dataIndex: 'configName' },
    { title: '键名', dataIndex: 'configKey' },
    {
      title: '内置',
      dataIndex: 'configType',
      align: 'center',
      width: 120,
      render: (configType) => (
        <ProTag color={configType === 'Y' ? 'success' : 'error'}>
          {configType === 'Y' ? '是' : '否'}
        </ProTag>
      ),
    },
    { title: '备注', dataIndex: 'remark', align: 'center' },
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
            onConfirm={() => onDeleteDept(record)}
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
  const rowSelection: TableRowSelection<Config> = {
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
    setQueryParams({ configName: undefined, configKey: undefined, configType: undefined });
    queryClient.invalidateQueries({ queryKey: ['config'] });
  };

  const onCreate = () => {
    setConfigModalProps((prev) => ({
      ...prev,
      show: true,
      title: '新增',
      formValue: {
        ...prev.formValue,
        order: 1,
        desc: '',
        status: 0,
      },
    }));
  };

  const onEdit = (formValue: Config) => {
    setConfigModalProps((prev) => ({
      ...prev,
      show: true,
      title: '编辑',
      edited: true,
      formValue,
    }));
  };

  const onFinish = (values: ConfigSearchFormFieldType) => {
    setQueryParams(values);
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm} onFinish={onFinish}>
          <Row gutter={[16, 16]}>
            <Col span={24} lg={6}>
              <Form.Item<ConfigSearchFormFieldType>
                label="名称"
                name="configName"
                className="!mb-0"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<ConfigSearchFormFieldType> label="编码" name="configKey" className="!mb-0">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<ConfigSearchFormFieldType>
                label="内置"
                name="configType"
                className="!mb-0"
              >
                <Select>
                  <Select.Option value="Y">
                    <ProTag color="success">是</ProTag>
                  </Select.Option>
                  <Select.Option value="N">
                    <ProTag color="error">否</ProTag>
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

      <Card
        title="参数列表"
        extra={
          <Button type="primary" onClick={onCreate}>
            新增
          </Button>
        }
      >
        <Table
          rowKey="configId"
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={false}
          columns={columns}
          dataSource={data?.data}
          rowSelection={{ ...rowSelection }}
        />
      </Card>

      <ConfigModal {...configModalPros} />
    </Space>
  );
}

type ConfigModalProps = {
  formValue: Config;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
  edited: boolean;
};

function ConfigModal({ title, show, formValue, onOk, onCancel, edited }: ConfigModalProps) {
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({ ...formValue });
  }, [formValue, form]);

  const createConfig = async () => {
    const values = await form.validateFields();
    if (edited) {
      const config = values as Config;
      config.id = formValue.id;
      await configService.updateConfig(config);
    } else {
      await configService.createConfig(values as Config);
    }
    onOk();
  };

  return (
    <Modal title={title} open={show} onOk={createConfig} onCancel={onCancel}>
      <Form
        initialValues={formValue}
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
      >
        <Form.Item<Config> label="参数名称" name="configName" required>
          <Input />
        </Form.Item>
        <Form.Item<Config> label="参数键名" name="configKey" required>
          <Input />
        </Form.Item>
        <Form.Item<Config> label="参数键值" name="configValue" required>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item<Config> label="是否内置" name="configType" required>
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio value="Y"> 是 </Radio>
            <Radio value="N"> 否 </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item<Config> label="备注" name="remark">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
}
