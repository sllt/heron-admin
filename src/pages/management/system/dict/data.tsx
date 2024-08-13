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
// import { TableRowSelection } from 'antd/es/table/interface';
import { useEffect, useMemo, useState } from 'react';

import dictService from '@/api/services/dictService';
import { IconButton, Iconify } from '@/components/icon';
import { useParams } from '@/router/hooks';
import ProTag from '@/theme/antd/components/tag';

import { Dict, DictSearchFormFieldType, DictType, Response } from '#/entity';

export default function DictTypePage() {
  const [searchForm] = Form.useForm();
  const queryClient = useQueryClient();
  const { id: currentDictId } = useParams();

  const [queryParams, setQueryParams] = useState<DictSearchFormFieldType>({
    dictType: undefined,
    dictLabel: undefined,
    status: undefined,
  });

  const { data: dictTypeList } = useQuery<Response<DictType[]>>({
    queryKey: ['dictType', null],
    queryFn: () => dictService.getDictTypeList({ size: 1000 }),
  });

  const selectFormData = dictTypeList?.data.map((item) => {
    return {
      label: item.dictName,
      value: item.dictType,
    };
  });

  const { data: currentDictType } = useQuery<DictType>({
    queryKey: ['currentDictType', currentDictId],
    queryFn: () => dictService.getDictType(currentDictId),
  });

  const dictType = currentDictType?.dictType;
  const { data: dictData, refetch: refetchDict } = useQuery<Response<Dict[]>>({
    queryKey: ['dict', dictType, queryParams],
    queryFn: () => {
      let params = { ...queryParams };
      if (dictType !== undefined && params.dictType === undefined) {
        params = { ...params, dictType };
      }
      return dictService.getDictList(params);
    },
  });

  const [postModalPros, setDictModalProps] = useState<DictModalProps>({
    formValue: {
      dictCode: 0,
      dictType: currentDictType?.dictType,
    },
    title: '新增',
    show: false,
    onOk: () => {
      setDictModalProps((prev) => ({ ...prev, show: false }));
      refetchDict();
    },
    onCancel: () => {
      setDictModalProps((prev) => ({ ...prev, show: false }));
    },
    edited: false,
  });

  useEffect(() => {
    if (currentDictType?.dictType !== undefined) {
      setDictModalProps((prev) => ({
        ...prev,
        formValue: {
          ...prev.formValue,
          dictType: currentDictType.dictType,
        },
      }));
      searchForm.setFieldValue('dictType', currentDictType.dictName);
    }
  }, [currentDictType, searchForm]);

  const showStatus = (status: number): string => {
    if (status === 1) {
      return '停用';
    }
    if (status === 2) {
      return '正常';
    }
    return '未知';
  };

  const onDeleteDict = async (dict: Dict) => {
    const ids = [dict.dictCode];
    await dictService.deleteDict(ids);
    await queryClient.invalidateQueries({ queryKey: ['dict'] });
  };

  const columns: ColumnsType<Dict> = [
    { title: '编号', dataIndex: 'dictCode' },
    { title: '标签', dataIndex: 'dictLabel', width: 110 },
    { title: '键值', dataIndex: 'dictValue', width: 110 },
    { title: '排序', dataIndex: 'dictSort' },
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
            onConfirm={() => onDeleteDict(record)}
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
  // const rowSelection: TableRowSelection<Dict> = {
  //   onChange: (selectedRowKeys, selectedRows) => {
  //     console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  //   },
  //   onSelect: (record, selected, selectedRows) => {
  //     console.log(record, selected, selectedRows);
  //   },
  //   onSelectAll: (selected, selectedRows, changeRows) => {
  //     console.log(selected, selectedRows, changeRows);
  //   },
  // };

  const onSearchFormReset = async () => {
    searchForm.resetFields();
    setQueryParams({ dictLabel: undefined, dictType: undefined, status: undefined });
    await queryClient.invalidateQueries({ queryKey: ['dict'] });
  };

  const onCreate = () => {
    setDictModalProps((prev) => ({
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

  const onEdit = (formValue: Dict) => {
    setDictModalProps((prev) => ({
      ...prev,
      show: true,
      title: '编辑',
      edited: true,
      formValue,
    }));
  };

  const onFinish = (values: DictSearchFormFieldType) => {
    setQueryParams(values);
  };
  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm} onFinish={onFinish}>
          <Row gutter={[16, 16]}>
            <Col span={24} lg={6}>
              <Form.Item<DictSearchFormFieldType>
                label="字典名称"
                name="dictType"
                className="!mb-0"
                // initialValue={currentDictlabel}
              >
                <Select
                  showSearch
                  placeholder="请选择"
                  optionFilterProp="label"
                  options={selectFormData}
                />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<DictSearchFormFieldType>
                label="字典标签"
                name="dictLabel"
                className="!mb-0"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<DictSearchFormFieldType> label="状态" name="status" className="!mb-0">
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
          rowKey="dictCode"
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={false}
          columns={columns}
          dataSource={dictData?.data}
          // rowSelection={{ ...rowSelection }}
        />
      </Card>

      <DictTypeModal {...postModalPros} />
    </Space>
  );
}

type DictModalProps = {
  formValue: Dict;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
  edited: boolean;
};

function DictTypeModal({ title, show, formValue, onOk, onCancel, edited }: DictModalProps) {
  const [form] = Form.useForm();
  const initialValues = useMemo(() => ({ ...formValue }), [formValue]);
  useEffect(() => {
    if (show) {
      form.setFieldsValue(initialValues);
    }
  }, [show, form, initialValues]);

  const createDictType = async () => {
    const values = await form.validateFields();
    if (edited) {
      const dict = values as Dict;
      dict.dictCode = formValue.dictCode;
      await dictService.updateDict(dict);
    } else {
      await dictService.createDict(values as Dict);
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
        <Form.Item<Dict> label="字典类型" name="dictType" required>
          <Input disabled />
        </Form.Item>
        <Form.Item<Dict> label="数据标签" name="dictLabel" required>
          <Input />
        </Form.Item>
        <Form.Item<Dict> label="数据键值" name="dictValue" required>
          <Input />
        </Form.Item>
        <Form.Item<Dict> label="显示顺序" name="dictSort" required>
          <InputNumber min={0} max={100} />
        </Form.Item>
        <Form.Item<Dict> label="状态" name="status" required>
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio value={2}> 正常 </Radio>
            <Radio value={1}> 停用 </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item<Dict> label="备注" name="remark">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
}
