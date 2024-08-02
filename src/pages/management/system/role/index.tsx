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
  Tree,
} from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import { useEffect, useState } from 'react';

import roleService from '@/api/services/roleService';
import menuService from '@/api/services/menuService';
import { IconButton, Iconify } from '@/components/icon';
import ProTag from '@/theme/antd/components/tag';

import { Role, RoleSearchFormFieldType, Response } from '#/entity';
import { flattenTrees } from '@/utils/tree';

export default function RolePage() {
  const [searchForm] = Form.useForm();
  const queryClient = useQueryClient();

  const [queryParams, setQueryParams] = useState<RoleSearchFormFieldType>({
    roleName: undefined,
    status: undefined,
    roleKey: undefined,
  });
  const { data, refetch } = useQuery<Response<Role[]>>({
    queryKey: ['role', queryParams],
    queryFn: () => roleService.getRoleList(queryParams),
  });

  const [roleModalPros, setRoleModalProps] = useState<RoleModalProps>({
    formValue: {
      roleId: 0,
      roleSort: 0,
      admin: false,
    },
    title: '新增',
    show: false,
    onOk: () => {
      setRoleModalProps((prev) => ({ ...prev, show: false }));
      refetch();
    },
    onCancel: () => {
      setRoleModalProps((prev) => ({ ...prev, show: false }));
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

  const onDeleteDept = async (role: Role) => {
    // console.log(role);
    const ids = [role.roleId];
    await roleService.deleteRole(ids);
    await queryClient.invalidateQueries({ queryKey: ['role'] });
  };

  const columns: ColumnsType<Role> = [
    { title: '角色名称', dataIndex: 'roleName', width: 300 },
    { title: '权限字符', dataIndex: 'roleKey' },
    { title: '排序', dataIndex: 'roleSort', align: 'center', width: 60 },
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
  const rowSelection: TableRowSelection<Role> = {
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
    setQueryParams({ roleName: undefined, status: undefined });
    await refetch();
  };

  const onCreate = () => {
    setRoleModalProps((prev) => ({
      ...prev,
      show: true,
      title: '新增',
      formValue: {
        ...prev.formValue,
        roleSort: 1,
        remark: '',
        status: '2',
      },
    }));
  };

  const onEdit = (formValue: Role) => {
    setRoleModalProps((prev) => ({
      ...prev,
      show: true,
      title: '编辑',
      edited: true,
      formValue,
    }));
  };

  const onFinish = (values: RoleSearchFormFieldType) => {
    setQueryParams(values);
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm} onFinish={onFinish}>
          <Row gutter={[16, 16]}>
            <Col span={24} lg={6}>
              <Form.Item<RoleSearchFormFieldType>
                label="角色名称"
                name="roleName"
                className="!mb-0"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<RoleSearchFormFieldType> label="权限编码" name="roleKey" className="!mb-0">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<RoleSearchFormFieldType> label="状态" name="status" className="!mb-0">
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
          rowKey="roleId"
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={false}
          columns={columns}
          dataSource={data?.data}
          rowSelection={{ ...rowSelection }}
        />
      </Card>

      <RoleModal {...roleModalPros} />
    </Space>
  );
}

type RoleModalProps = {
  formValue: Role;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
  edited: boolean;
};

function RoleModal({ title, show, formValue, onOk, onCancel, edited }: RoleModalProps) {
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({ ...formValue });
  }, [formValue, form]);

  const { data: menuList } = useQuery({ queryKey: ['menuList'], queryFn: menuService.getMenuList });

  const flattenedPermissions = flattenTrees(formValue.permission);
  const checkedKeys = flattenedPermissions.map((item) => item.menuId);

  const createRole = async () => {
    const values = await form.validateFields();
    if (edited) {
      const role = values as Role;
      role.roleId = formValue.roleId;
      await roleService.updateRole(role);
    } else {
      await roleService.createRole(values as Role);
    }
    onOk();
  };

  return (
    <Modal title={title} open={show} onOk={createRole} onCancel={onCancel}>
      <Form
        initialValues={formValue}
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
      >
        <Form.Item<Role> label="角色名称" name="roleName" required>
          <Input />
        </Form.Item>
        <Form.Item<Role> label="权限编码" name="roleKey" required>
          <Input />
        </Form.Item>
        <Form.Item<Role> label="排序" name="roleSort" required>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item<Role> label="状态" name="status" required>
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio value="2"> 正常 </Radio>
            <Radio value="1"> 停用 </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item<Role> label="备注" name="remark">
          <Input.TextArea />
        </Form.Item>

        <Form.Item<Role> label="菜单列表" name="permission">
          <Tree
            checkable
            checkedKeys={checkedKeys}
            treeData={menuList}
            fieldNames={{
              key: 'menuId',
              children: 'children',
              title: 'title',
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
