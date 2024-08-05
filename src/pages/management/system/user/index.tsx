import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Col, Form, Input, Modal, Popconfirm, Radio, Row, Select, Space } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import { useEffect, useState } from 'react';

import userService from '@/api/services/userService';
import { IconButton, Iconify } from '@/components/icon';
import ProTag from '@/theme/antd/components/tag';

import { User, Response, UserSearchFormFieldType } from '#/entity';
import { useThemeToken } from '@/theme/hooks';

export default function UserPage() {
  const [searchForm] = Form.useForm();
  const queryClient = useQueryClient();
  const { colorTextSecondary } = useThemeToken();

  const [queryParams, setQueryParams] = useState<UserSearchFormFieldType>({
    username: undefined,
    status: undefined,
    phone: undefined,
  });
  const { data, refetch } = useQuery<Response<User[]>>({
    queryKey: ['user', queryParams],
    queryFn: () => userService.getUserList(queryParams),
  });

  const [userModalPros, setUserModalProps] = useState<UserModalProps>({
    formValue: {
      userId: 0,
    },
    title: '新增',
    show: false,
    onOk: () => {
      setUserModalProps((prev) => ({ ...prev, show: false }));
      refetch();
    },
    onCancel: () => {
      setUserModalProps((prev) => ({ ...prev, show: false }));
    },
    edited: false,
  });

  const showStatus = (status: string): string => {
    if (status === '1') {
      return '停用';
    }
    if (status === '2') {
      return '正常';
    }
    return '未知';
  };

  const onDeleteUser = async (user: User) => {
    // console.log(user);
    const ids = [user.userId];
    await userService.deleteUser(ids);
    await queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  const columns: ColumnsType<User> = [
    { title: '编号', dataIndex: 'userId' },
    {
      title: '登录名',
      dataIndex: 'username',
      width: 300,
      render: (_, record) => {
        return (
          <div className="flex">
            <img alt="" src={record.avatar} className="h-10 w-10 rounded-full" />
            <div className="ml-2 flex flex-col">
              <span className="text-sm">{record.username}</span>
              <span style={{ color: colorTextSecondary }} className="text-xs">
                {record.phone}
              </span>
            </div>
          </div>
        );
      },
    },
    { title: '昵称', dataIndex: 'nickName' },
    { title: '部门', dataIndex: 'dept', render: (dept) => dept.deptName },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 120,
      render: (status) => (
        <ProTag color={status === '2' ? 'success' : 'error'}>{showStatus(status)}</ProTag>
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
          <IconButton
            onClick={() => {
              // TODO: redirect to user detail
              console.log(record.userId);
            }}
          >
            <Iconify icon="mdi:card-account-details" size={18} />
          </IconButton>
          <IconButton onClick={() => onEdit(record)}>
            <Iconify icon="solar:pen-bold-duotone" size={18} />
          </IconButton>
          <Popconfirm
            onConfirm={() => onDeleteUser(record)}
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
  const rowSelection: TableRowSelection<User> = {
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
    setQueryParams({ username: undefined, status: undefined });
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  const onCreate = () => {
    setUserModalProps((prev) => ({
      ...prev,
      show: true,
      title: '新增',
      formValue: {
        ...prev.formValue,
      },
    }));
  };

  const onEdit = (formValue: User) => {
    setUserModalProps((prev) => ({
      ...prev,
      show: true,
      title: '编辑',
      edited: true,
      formValue,
    }));
  };

  const onFinish = (values: UserSearchFormFieldType) => {
    setQueryParams(values);
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm} onFinish={onFinish}>
          <Row gutter={[16, 16]}>
            <Col span={24} lg={5}>
              <Form.Item<UserSearchFormFieldType>
                label="用户名称"
                name="username"
                className="!mb-0"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<UserSearchFormFieldType> label="手机号码" name="phone" className="!mb-0">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={5}>
              <Form.Item<UserSearchFormFieldType> label="部门" name="deptId" className="!mb-0">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={4}>
              <Form.Item<UserSearchFormFieldType> label="状态" name="status" className="!mb-0">
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
            <Col span={24} lg={4}>
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
          rowKey="userId"
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={false}
          columns={columns}
          dataSource={data?.data}
          rowSelection={{ ...rowSelection }}
        />
      </Card>

      <UserModal {...userModalPros} />
    </Space>
  );
}

type UserModalProps = {
  formValue: User;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
  edited: boolean;
};

function UserModal({ title, show, formValue, onOk, onCancel, edited }: UserModalProps) {
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({ ...formValue });
  }, [formValue, form]);

  const createUser = async () => {
    const values = await form.validateFields();
    if (edited) {
      const user = values as User;
      user.userId = formValue.userId;
      await userService.updateUser(user);
    } else {
      await userService.createUser(values as User);
    }
    onOk();
  };

  return (
    <Modal title={title} open={show} onOk={createUser} onCancel={onCancel}>
      <Form
        initialValues={formValue}
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
      >
        <Form.Item<User> label="岗位名称" name="username" required>
          <Input />
        </Form.Item>
        <Form.Item<User> label="岗位编码" name="phone" required>
          <Input />
        </Form.Item>
        {/* <Form.Item<User> label="排序" name="sort" required> */}
        {/*   <InputNumber style={{ width: '100%' }} /> */}
        {/* </Form.Item> */}
        <Form.Item<User> label="状态" name="status" required>
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio value={2}> 正常 </Radio>
            <Radio value={1}> 停用 </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item<User> label="备注" name="remark">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
}
