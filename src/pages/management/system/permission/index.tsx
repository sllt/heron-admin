import { Button, Card, Popconfirm } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { isNil } from 'ramda';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IconButton, Iconify, SvgIcon } from '@/components/icon';
import { useUserPermission, usePermissionUpdate } from '@/store/userStore';
import ProTag from '@/theme/antd/components/tag';

import PermissionModal, { type PermissionModalProps } from './permission-modal';

import { Permission } from '#/entity';
import { BasicStatus, PermissionType } from '#/enum';
import menuService from '@/api/services/menuService';

const defaultPermissionValue: Permission = {
  menuId: 0,
  parentId: 0,
  menuName: '',
  label: '',
  path: '',
  component: '',
  icon: '',
  hide: false,
  status: BasicStatus.ENABLE,
  menuType: PermissionType.CATALOGUE,
};
export default function PermissionPage() {
  const permissions = useUserPermission();
  const { t } = useTranslation();
  const permissionUpdate = usePermissionUpdate();

  const [permissionModalProps, setPermissionModalProps] = useState<PermissionModalProps>({
    formValue: { ...defaultPermissionValue },
    title: '新增',
    show: false,
    onOk: async () => {
      setPermissionModalProps((prev) => ({ ...prev, show: false }));
      await permissionUpdate();
    },
    onCancel: () => {
      setPermissionModalProps((prev) => ({ ...prev, show: false }));
    },
    edited: false,
  });

  const menuTypeText = (type: string): string => {
    switch (type) {
      case PermissionType.CATALOGUE:
        return '目录';
      case PermissionType.MENU:
        return '菜单';
      case PermissionType.BUTTON:
        return '按钮';
      default:
        return '未知';
    }
  };

  const onDeletePermission = async (record: Permission) => {
    const ids = [record.menuId];
    await menuService.deleteMenu(ids);
    await permissionUpdate();
  };

  const columns: ColumnsType<Permission> = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 300,
      render: (_, record) => <div>{t(record.label)}</div>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 60,
      render: (_, record) => <ProTag color="processing">{menuTypeText(record.menuType)}</ProTag>,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 60,
      render: (icon: string) => {
        if (isNil(icon)) return '';
        if (icon.startsWith('ic')) {
          return <SvgIcon icon={icon} size={18} className="ant-menu-item-icon" />;
        }
        return <Iconify icon={icon} size={18} className="ant-menu-item-icon" />;
      },
    },
    {
      title: '组件',
      dataIndex: 'component',
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 120,
      render: (status) => (
        <ProTag color={status === BasicStatus.DISABLE ? 'error' : 'success'}>
          {status === BasicStatus.DISABLE ? 'Disable' : 'Enable'}
        </ProTag>
      ),
    },
    { title: '排序', dataIndex: 'order', width: 60 },
    {
      title: '操作',
      key: 'operation',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <div className="flex w-full justify-end text-gray">
          {record?.menuType === PermissionType.CATALOGUE && (
            <IconButton onClick={() => onCreate(record.menuId)}>
              <Iconify icon="gridicons:add-outline" size={18} />
            </IconButton>
          )}
          <IconButton onClick={() => onEdit(record)}>
            <Iconify icon="solar:pen-bold-duotone" size={18} />
          </IconButton>
          <Popconfirm
            title="确定删除"
            okText="是"
            cancelText="否"
            placement="left"
            onConfirm={() => onDeletePermission(record)}
          >
            <IconButton>
              <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
            </IconButton>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const onCreate = (parentId?: number) => {
    setPermissionModalProps((prev) => ({
      ...prev,
      show: true,
      ...defaultPermissionValue,
      title: 'New',
      formValue: { ...defaultPermissionValue, parentId: parentId ?? 0 },
    }));
  };

  const onEdit = (formValue: Permission) => {
    setPermissionModalProps((prev) => ({
      ...prev,
      show: true,
      title: '编辑',
      formValue,
    }));
  };
  return (
    <Card
      title="菜单列表"
      extra={
        <Button type="primary" onClick={() => onCreate()}>
          新增
        </Button>
      }
    >
      <Table
        rowKey="menuId"
        size="small"
        scroll={{ x: 'max-content' }}
        pagination={false}
        columns={columns}
        dataSource={permissions}
      />

      <PermissionModal {...permissionModalProps} />
    </Card>
  );
}
