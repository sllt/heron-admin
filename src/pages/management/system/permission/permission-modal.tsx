import { AutoComplete, Form, Input, InputNumber, Modal, Radio, TreeSelect } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { pagesSelect } from '@/router/hooks/use-permission-routes';
import { useUserPermission } from '@/store/userStore';

import { Permission } from '#/entity';
import { BasicStatus, PermissionType } from '#/enum';
import menuService from '@/api/services/menuService';

export type PermissionModalProps = {
  formValue: Permission;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
  edited: boolean;
};

export default function PermissionModal({
  title,
  show,
  formValue,
  onOk,
  onCancel,
  edited,
}: PermissionModalProps) {
  const [form] = Form.useForm();
  const permissions = useUserPermission();
  const [compOptions, setCompOptions] = useState(pagesSelect);

  const getParentNameById = useCallback(
    (parentId: number, data: Permission[] | undefined = permissions) => {
      let name = '';
      if (!data || !parentId) return name;
      for (let i = 0; i < data.length; i += 1) {
        if (data[i].menuId === parentId) {
          name = data[i].title!;
        } else if (data[i].children) {
          name = getParentNameById(parentId, data[i].children);
        }
        if (name) {
          break;
        }
      }
      return name;
    },
    [permissions],
  );

  const updateCompOptions = (name: string) => {
    setCompOptions(
      pagesSelect.filter((path) => {
        return path.value.includes(name.toLowerCase());
      }),
    );
  };

  const onCreatePermission = async () => {
    const values = await form.validateFields();
    if (edited) {
      const menu = values as Permission;
      menu.menuId = formValue.menuId;
      await menuService.updateMenu(menu);
    } else {
      await menuService.createMenu(values as Permission);
    }
    onOk();
  };

  useEffect(() => {
    form.setFieldsValue({ ...formValue });
    if (formValue.parentId) {
      const parentName = getParentNameById(formValue.parentId);
      updateCompOptions(parentName);
    }
  }, [formValue, form, getParentNameById]);

  return (
    <Modal title={title} open={show} onOk={onCreatePermission} onCancel={onCancel}>
      <Form
        initialValues={formValue}
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
      >
        <Form.Item<Permission> label="类型" name="menuType" required>
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio value={PermissionType.CATALOGUE}>目录</Radio>
            <Radio value={PermissionType.MENU}>菜单</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item<Permission> label="名称" name="title" required>
          <Input />
        </Form.Item>

        <Form.Item<Permission> label="标签" name="menuName" required tooltip="设置i18n的key">
          <Input />
        </Form.Item>

        <Form.Item<Permission> label="上级" name="parentId" required>
          <TreeSelect
            fieldNames={{
              label: 'name',
              value: 'id',
              children: 'children',
            }}
            allowClear
            treeData={permissions}
            onChange={(_value, labelList) => {
              updateCompOptions(labelList[0] as string);
            }}
          />
        </Form.Item>

        <Form.Item<Permission> label="路径" name="path" required>
          <Input />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.menuType !== currentValues.menuType
          }
        >
          {({ getFieldValue }) => {
            if (getFieldValue('menuType') === PermissionType.MENU) {
              return (
                <Form.Item<Permission>
                  label="组件"
                  name="component"
                  required={getFieldValue('menuType') === PermissionType.MENU}
                >
                  <AutoComplete
                    options={compOptions}
                    filterOption={(input, option) =>
                      ((option?.label || '') as string).toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              );
            }
            return null;
          }}
        </Form.Item>

        <Form.Item<Permission> label="图标" name="icon" tooltip="图标应以ic开头">
          <Input />
        </Form.Item>

        <Form.Item<Permission> label="隐藏" name="hide" tooltip="是否隐藏">
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio value={false}>显示</Radio>
            <Radio value>隐藏</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item<Permission> label="排序" name="order">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item<Permission> label="状态" name="status" required>
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio value={BasicStatus.ENABLE}> 正常 </Radio>
            <Radio value={BasicStatus.DISABLE}> 停用 </Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}
