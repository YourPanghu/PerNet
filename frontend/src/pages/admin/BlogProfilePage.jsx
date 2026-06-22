import { useState, useEffect, useRef } from 'react';
import { Typography, Form, Input, Button, Card, Spin, message, Divider, Avatar, Upload } from 'antd';
import { SaveOutlined, UserOutlined, PictureOutlined, EditOutlined, UploadOutlined, CameraOutlined } from '@ant-design/icons';
import { fetchProfile } from '../../api/profileApi';
import client from '../../api/client';

const { Title } = Typography;
const { TextArea } = Input;

export default function BlogProfilePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setFetching(true);
    try {
      const data = await fetchProfile();
      form.setFieldsValue({
        nickname: data.nickname || '',
        avatar: data.avatar || '',
        coverImage: data.coverImage || '',
        bio: data.bio || '',
      });
    } catch {
      // error handled by interceptor
    } finally {
      setFetching(false);
    }
  };

  const handleUpload = async (file, field) => {
    const formData = new FormData();
    formData.append('file', file);
    const setter = field === 'avatar' ? setAvatarUploading : setCoverUploading;
    setter(true);
    try {
      const res = await client.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      form.setFieldsValue({ [field]: res.url });
      message.success(`${field === 'avatar' ? '头像' : '封面图'} 上传成功`);
    } catch {
      message.error('上传失败');
    } finally {
      setter(false);
    }
    return false; // prevent default upload
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await client.put('/admin/profile', values);
      message.success('博客设置已更新');
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 24 }}>博客设置</Title>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="nickname"
            label={<span><UserOutlined style={{ marginRight: 6 }} />博主昵称</span>}
            rules={[{ max: 50, message: '昵称最多 50 个字符' }]}
          >
            <Input placeholder="输入昵称" />
          </Form.Item>

          {/* 头像区域 */}
          <Form.Item label={<span><CameraOutlined style={{ marginRight: 6 }} />头像</span>}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
              <Avatar
                size={64}
                src={form.getFieldValue('avatar') || undefined}
                style={{ backgroundColor: form.getFieldValue('avatar') ? 'transparent' : '#1677ff', fontSize: 28 }}
              >
                {(form.getFieldValue('nickname') || 'P')[0]?.toUpperCase()}
              </Avatar>
              <Upload
                beforeUpload={(file) => handleUpload(file, 'avatar')}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={avatarUploading}>
                  上传头像
                </Button>
              </Upload>
            </div>
            <Form.Item name="avatar" noStyle>
              <Input placeholder="或手动输入头像图片 URL" />
            </Form.Item>
          </Form.Item>

          {/* 封面图区域 */}
          <Form.Item label={<span><PictureOutlined style={{ marginRight: 6 }} />首页封面图片</span>}>
            <div style={{ marginBottom: 8 }}>
              {form.getFieldValue('coverImage') && (
                <img
                  src={form.getFieldValue('coverImage')}
                  alt="封面预览"
                  style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                />
              )}
              <Upload
                beforeUpload={(file) => handleUpload(file, 'coverImage')}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={coverUploading}>
                  上传封面图
                </Button>
              </Upload>
            </div>
            <Form.Item name="coverImage" noStyle>
              <Input placeholder="或手动输入封面图片 URL" />
            </Form.Item>
          </Form.Item>

          <Form.Item
            name="bio"
            label={<span><EditOutlined style={{ marginRight: 6 }} />个性签名</span>}
            rules={[{ max: 255, message: '签名最多 255 个字符' }]}
          >
            <TextArea rows={3} placeholder="一句话介绍自己" />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large">
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
