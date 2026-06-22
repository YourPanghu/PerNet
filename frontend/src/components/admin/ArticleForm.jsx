import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from './RichTextEditor';
import { fetchCategories } from '../../api/categoryApi';
import { fetchTags } from '../../api/tagApi';

const { TextArea } = Input;

export default function ArticleForm({ initialValues, onSubmit, loading, submitLabel = '保存' }) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    fetchTags().then(setTags).catch(() => {});
  }, []);

  const handleFinish = (values) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues || { status: 'PUBLISHED' }}
      onFinish={handleFinish}
    >
      <Form.Item
        name="title"
        label="标题"
        rules={[
          { required: true, message: '请输入文章标题' },
          { max: 200, message: '标题最多 200 个字符' },
        ]}
      >
        <Input placeholder="输入文章标题" size="large" />
      </Form.Item>

      <Form.Item
        name="categoryId"
        label="分类"
      >
        <Select placeholder="选择文章分类" allowClear style={{ maxWidth: 300 }}>
          {categories.map((cat) => (
            <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="tagIds"
        label="标签"
      >
        <Select
          mode="multiple"
          placeholder="选择文章标签"
          allowClear
          style={{ maxWidth: 400 }}
        >
          {tags.map((tag) => (
            <Select.Option key={tag.id} value={tag.id}>{tag.name}</Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="summary"
        label="摘要"
        rules={[{ max: 500, message: '摘要最多 500 个字符' }]}
      >
        <TextArea rows={3} placeholder="输入文章摘要（可选）" />
      </Form.Item>

      <Form.Item name="coverImage" label="封面图片 URL">
        <Input placeholder="输入封面图片链接（可选）" />
      </Form.Item>

      <Form.Item
        name="status"
        label="状态"
        rules={[{ required: true, message: '请选择文章状态' }]}
      >
        <Select>
          <Select.Option value="PUBLISHED">已发布</Select.Option>
          <Select.Option value="DRAFT">草稿</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="content"
        label="正文"
        rules={[{ required: true, message: '请输入文章正文' }]}
        getValueFromEvent={(value) => value}
      >
        <RichTextEditor />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large">
            {submitLabel}
          </Button>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin')} size="large">
            取消
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
