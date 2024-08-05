import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Col, Form, Input, Modal, Popconfirm, Radio, Row, Select, Space } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import { useEffect, useState } from 'react';

import dictService from '@/api/services/dictService';
import { IconButton, Iconify } from '@/components/icon';
import ProTag from '@/theme/antd/components/tag';

import { DictType, DictTypeSearchFormFieldType, Response } from '#/entity';

export default function DictTypePage() {
  const [searchForm] = Form.useForm();
  const queryClient = useQueryClient();

  const [queryParams, setQueryParams] = useState<DictTypeSearchFormFieldType>({
    dictName: undefined,
    dictType: undefined,
    status: undefined,
  });
  const { data, refetch } = useQuery<Response<DictType[]>>({
    queryKey: ['dictType', queryParams],
    queryFn: () => dictService.getDictTypeList(queryParams),
  });

  const [postModalPros, setDictTypeModalProps] = useState<DictTypeModalProps>({
    formValue: {
      id: 0,
    },
    title: '新增',
    show: false,
    onOk: () => {
      setDictTypeModalProps((prev) => ({ ...prev, show: false }));
      refetch();
    },
    onCancel: () => {
      setDictTypeModalProps((prev) => ({ ...prev, show: false }));
    },
    edited: false,
  });

  const showStatus = (status: number): string => {
    if (status === 1) {
      return '停用';
    }
    if (status === 2) {
      return '正常';
    }
    return '未知';
  };

  const onDeleteDictType = async (post: DictType) => {
    // console.log(post);
    const ids = [post.id];
    await dictService.deleteDictType(ids);
    await queryClient.invalidateQueries({ queryKey: ['post'] });
  };

  const columns: ColumnsType<DictType> = [
    { title: '编号', dataIndex: 'id' },
    { title: '名称', dataIndex: 'dictName', width: 110 },
    {
      title: '类型',
      dataIndex: 'dictType',
      align: 'center',
      width: 110,
      render: (dictType, record) => <a href={`/dict/${record.id}`}>{dictType}</a>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 90,
      render: (status) => (
        <ProTag color={status === 2 ? 'success' : 'error'}>{showStatus(status)}</ProTag>
      ),
    },
    { title: '备注', dataIndex: 'remark', align: 'center', width: 300 },
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
            onConfirm={() => onDeleteDictType(record)}
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
  const rowSelection: TableRowSelection<DictType> = {
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
    setQueryParams({ dictName: undefined, dictType: undefined, status: undefined });
    queryClient.invalidateQueries({ queryKey: ['dictType'] });
  };

  const onCreate = () => {
    setDictTypeModalProps((prev) => ({
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

  const onEdit = (formValue: DictType) => {
    setDictTypeModalProps((prev) => ({
      ...prev,
      show: true,
      title: '编辑',
      edited: true,
      formValue,
    }));
  };

  const onFinish = (values: DictTypeSearchFormFieldType) => {
    setQueryParams(values);
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm} onFinish={onFinish}>
          <Row gutter={[16, 16]}>
            <Col span={24} lg={6}>
              <Form.Item<DictTypeSearchFormFieldType>
                label="字典名称"
                name="dictName"
                className="!mb-0"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<DictTypeSearchFormFieldType>
                label="字典类型"
                name="dictType"
                className="!mb-0"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<DictTypeSearchFormFieldType> label="状态" name="status" className="!mb-0">
                <Select>
                  <Select.Option value={2}>
                    <ProTag color="success">正常</ProTag>
                  </Select.Option>
                  <Select.Option value={1}>
                    <ProTag color="error">停用</ProTag>
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
        title="部门列表"
        extra={
          <Button type="primary" onClick={onCreate}>
            新增
          </Button>
        }
      >
        <Table
          rowKey="id"
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={false}
          columns={columns}
          dataSource={data?.data}
          rowSelection={{ ...rowSelection }}
        />
      </Card>

      <DictTypeModal {...postModalPros} />
    </Space>
  );
}

type DictTypeModalProps = {
  formValue: DictType;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
  edited: boolean;
};

function DictTypeModal({ title, show, formValue, onOk, onCancel, edited }: DictTypeModalProps) {
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({ ...formValue });
  }, [formValue, form]);

  const createDictType = async () => {
    const values = await form.validateFields();
    if (edited) {
      const dictType = values as DictType;
      dictType.id = formValue.id;
      await dictService.updateDictType(dictType);
    } else {
      await dictService.createDictType(values as DictType);
    }
    onOk();
  };

  return (
    <Modal title={title} open={show} onOk={createDictType} onCancel={onCancel}>
      <Form
        initialValues={formValue}
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
      >
        <Form.Item<DictType> label="岗位名称" name="dictName" required>
          <Input />
        </Form.Item>
        <Form.Item<DictType> label="岗位编码" name="dictType" required>
          <Input />
        </Form.Item>
        <Form.Item<DictType> label="状态" name="status" required>
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio value={2}> 正常 </Radio>
            <Radio value={1}> 停用 </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item<DictType> label="备注" name="remark">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
}
