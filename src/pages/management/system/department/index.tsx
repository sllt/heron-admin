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
  TreeSelect,
} from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import { useEffect, useState } from 'react';

import deptService from '@/api/services/deptService';
import { IconButton, Iconify } from '@/components/icon';
import ProTag from '@/theme/antd/components/tag';

import DepartmentChart from './department-chart';

import { Department, SearchFormFieldType } from '#/entity';

export default function DepartmentPage() {
  const [searchForm] = Form.useForm();
  const queryClient = useQueryClient();

  const [queryParams, setQueryParams] = useState<SearchFormFieldType>({
    deptName: undefined,
    status: undefined,
  });
  const { data, refetch } = useQuery<Department[]>({
    queryKey: ['dept', queryParams],
    queryFn: () => deptService.getDeptList(queryParams),
  });

  const [departmentModalPros, setDepartmentModalProps] = useState<DepartmentModalProps>({
    formValue: {
      deptId: 0,
      deptName: '',
      status: 0,
      parentId: undefined,
      deptPath: '',
      sort: 0,
      email: '',
      dataScope: '',
      createdAt: '',
    },
    title: '新增',
    show: false,
    onOk: () => {
      setDepartmentModalProps((prev) => ({ ...prev, show: false }));
      refetch();
    },
    onCancel: () => {
      setDepartmentModalProps((prev) => ({ ...prev, show: false }));
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

  const onDeleteDept = async (dept: Department) => {
    const ids = [dept.deptId];
    const result = await deptService.deleteDept(ids);
    console.log(result);
    await queryClient.invalidateQueries({ queryKey: ['dept'] });
  };

  const columns: ColumnsType<Department> = [
    { title: '部门名称', dataIndex: 'deptName', width: 300 },
    { title: '排序', dataIndex: 'sort', align: 'center', width: 60 },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 120,
      render: (status) => (
        <ProTag color={status === 2 ? 'success' : 'error'}>{showStatus(status)}</ProTag>
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
  const rowSelection: TableRowSelection<Department> = {
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
    setQueryParams({ deptName: undefined, status: undefined });
    await refetch();
  };

  const onCreate = () => {
    setDepartmentModalProps((prev) => ({
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

  const onEdit = (formValue: Department) => {
    setDepartmentModalProps((prev) => ({
      ...prev,
      show: true,
      title: '编辑',
      edited: true,
      formValue,
    }));
  };

  const onFinish = (values: SearchFormFieldType) => {
    setQueryParams(values);
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm} onFinish={onFinish}>
          <Row gutter={[16, 16]}>
            <Col span={24} lg={6}>
              <Form.Item<SearchFormFieldType> label="部门名称" name="deptName" className="!mb-0">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<SearchFormFieldType> label="状态" name="status" className="!mb-0">
                <Select>
                  <Select.Option value="2">
                    <ProTag color="success">正常</ProTag>
                  </Select.Option>
                  <Select.Option value="1">
                    <ProTag color="error">停用</ProTag>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} lg={12}>
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
          rowKey="deptId"
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={false}
          columns={columns}
          dataSource={data}
          rowSelection={{ ...rowSelection }}
        />
      </Card>

      <Card title="部门图示">
        <DepartmentChart departments={data} />
      </Card>

      <OrganizationModal {...departmentModalPros} />
    </Space>
  );
}

type DepartmentModalProps = {
  formValue: Department;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
  edited: boolean;
};

function OrganizationModal({
  title,
  show,
  formValue,
  onOk,
  onCancel,
  edited,
}: DepartmentModalProps) {
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({ ...formValue });
  }, [formValue, form]);

  const createDept = async () => {
    const values = await form.validateFields();
    if (edited) {
      const dept = values as Department;
      dept.deptId = formValue.deptId;
      await deptService.updateDept(dept);
    } else {
      await deptService.createDept(values as Department);
    }
    onOk();
  };

  const { data } = useQuery({
    queryKey: ['dept'],
    queryFn: () => deptService.getDeptList({}),
  });

  const treeData = [
    {
      deptName: '主类目',
      deptId: 0,
      children: data,
    },
  ];

  return (
    <Modal title={title} open={show} onOk={createDept} onCancel={onCancel}>
      <Form
        initialValues={formValue}
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
      >
        <Form.Item<Department> label="部门名称" name="deptName" required>
          <Input />
        </Form.Item>
        <Form.Item<Department> label="上级部门" name="parentId" required>
          <TreeSelect
            fieldNames={{
              label: 'deptName',
              value: 'deptId',
              children: 'children',
            }}
            allowClear
            treeData={treeData}
          />
        </Form.Item>
        <Form.Item<Department> label="排序" name="sort" required>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item<Department> label="状态" name="status" required>
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio value={2}> 正常 </Radio>
            <Radio value={1}> 停用 </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item<Department> label="负责人" name="leader" required>
          <Input />
        </Form.Item>
        <Form.Item<Department> label="联系电话" name="phone" required>
          <Input />
        </Form.Item>
        <Form.Item<Department> label="备注" name="remark">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
}
