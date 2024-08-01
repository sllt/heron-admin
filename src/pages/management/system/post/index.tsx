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

import postService from '@/api/services/postService';
import { IconButton, Iconify } from '@/components/icon';
import ProTag from '@/theme/antd/components/tag';

import { Post, PostSearchFormFieldType, Response } from '#/entity';

export default function PostPage() {
  const [searchForm] = Form.useForm();
  const queryClient = useQueryClient();

  const [queryParams, setQueryParams] = useState<PostSearchFormFieldType>({
    postName: undefined,
    status: undefined,
    postCode: undefined,
  });
  const { data, refetch } = useQuery<Response<Post[]>>({
    queryKey: ['post', queryParams],
    queryFn: () => postService.getPostList(queryParams),
  });

  const [postModalPros, setPostModalProps] = useState<PostModalProps>({
    formValue: {
      postId: 0,
      sort: 0,
    },
    title: '新增',
    show: false,
    onOk: () => {
      setPostModalProps((prev) => ({ ...prev, show: false }));
      refetch();
    },
    onCancel: () => {
      setPostModalProps((prev) => ({ ...prev, show: false }));
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

  const onDeleteDept = async (post: Post) => {
    // console.log(post);
    const ids = [post.postId];
    await postService.deletePost(ids);
    await queryClient.invalidateQueries({ queryKey: ['post'] });
  };

  const columns: ColumnsType<Post> = [
    { title: '岗位编码', dataIndex: 'postCode' },
    { title: '岗位名称', dataIndex: 'postName', width: 300 },
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
  const rowSelection: TableRowSelection<Post> = {
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
    setQueryParams({ postName: undefined, status: undefined });
    await refetch();
  };

  const onCreate = () => {
    setPostModalProps((prev) => ({
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

  const onEdit = (formValue: Post) => {
    setPostModalProps((prev) => ({
      ...prev,
      show: true,
      title: '编辑',
      edited: true,
      formValue,
    }));
  };

  const onFinish = (values: PostSearchFormFieldType) => {
    setQueryParams(values);
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm} onFinish={onFinish}>
          <Row gutter={[16, 16]}>
            <Col span={24} lg={6}>
              <Form.Item<PostSearchFormFieldType>
                label="岗位名称"
                name="postName"
                className="!mb-0"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<PostSearchFormFieldType>
                label="岗位编码"
                name="postCode"
                className="!mb-0"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<PostSearchFormFieldType> label="状态" name="status" className="!mb-0">
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
          rowKey="deptId"
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={false}
          columns={columns}
          dataSource={data?.data}
          rowSelection={{ ...rowSelection }}
        />
      </Card>

      <PostModal {...postModalPros} />
    </Space>
  );
}

type PostModalProps = {
  formValue: Post;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
  edited: boolean;
};

function PostModal({ title, show, formValue, onOk, onCancel, edited }: PostModalProps) {
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({ ...formValue });
  }, [formValue, form]);

  const createPost = async () => {
    const values = await form.validateFields();
    if (edited) {
      const post = values as Post;
      post.postId = formValue.postId;
      await postService.updatePost(post);
    } else {
      await postService.createPost(values as Post);
    }
    onOk();
  };

  return (
    <Modal title={title} open={show} onOk={createPost} onCancel={onCancel}>
      <Form
        initialValues={formValue}
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
      >
        <Form.Item<Post> label="岗位名称" name="postName" required>
          <Input />
        </Form.Item>
        <Form.Item<Post> label="岗位编码" name="postCode" required>
          <Input />
        </Form.Item>
        <Form.Item<Post> label="排序" name="sort" required>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item<Post> label="状态" name="status" required>
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio value={2}> 正常 </Radio>
            <Radio value={1}> 停用 </Radio>
          </Radio.Group>
        </Form.Item>
        {/* <Form.Item<Post> label="负责人" name="leader" required> */}
        {/*   <Input /> */}
        {/* </Form.Item> */}
        {/* <Form.Item<Post> label="联系电话" name="phone" required> */}
        {/*   <Input /> */}
        {/* </Form.Item> */}
        <Form.Item<Post> label="备注" name="remark">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
}
