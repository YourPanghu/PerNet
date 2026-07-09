import client from '../../api/client';

// ---------- 表格插入弹窗 ----------
function TableInsertModal({ open, onOk, onCancel }) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hasHeader, setHasHeader] = useState(true);

  return (
    <Modal
      title="插入表格"
      open={open}
      onOk={() => {
        onOk(rows, cols, { hasHeader });
        setRows(3);
        setCols(3);
        setHasHeader(true);
      }}
      onCancel={onCancel}
      okText="插入"
      cancelText="取消"
      width={360}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>行数</span>
          <InputNumber min={2} max={20} value={rows} onChange={setRows} style={{ width: 120 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>列数</span>
          <InputNumber min={2} max={12} value={cols} onChange={setCols} style={{ width: 120 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>包含表头</span>
          <Switch checked={hasHeader} onChange={setHasHeader} />
        </div>
      </Space>
    </Modal>
  );
}

// ---------- 工具栏按钮 ----------
function ToolButton({ icon, title, isActive, onClick, style }) {
  return (
    <Button
      size="small"
      type={isActive ? 'primary' : 'default'}
      icon={icon}
      title={title}
      onClick={onClick}
      style={{ fontSize: 13, ...style }}
    />
  );
}

// ---------- 颜色选择器 ----------
const TEXT_COLORS = [
  '#000000', '#262626', '#595959', '#8c8c8c', '#bfbfbf', '#d9d9d9',
  '#f5222d', '#fa541c', '#fa8c16', '#fadb14', '#52c41a', '#13c2c2',
  '#1677ff', '#2f54eb', '#722ed1', '#eb2f96',
];

const HIGHLIGHT_COLORS = [
  '#ffd6d6', '#ffe7ba', '#fff7b0', '#d9f7be', '#b5f5ec', '#bae0ff',
  '#d6e8ff', '#efdbff', '#ffd8e8', '#ffffff',
];

function ColorPicker({ editor, type }) {
  const colors = type === 'text' ? TEXT_COLORS : HIGHLIGHT_COLORS;
  const isText = type === 'text';

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: 152, padding: 4 }}>
      {colors.map((c) => (
        <div
          key={c}
          title={c}
          onClick={() => {
            if (isText) {
              if (c === '#000000') editor.chain().focus().unsetColor().run();
              else editor.chain().focus().setColor(c).run();
            } else {
              editor.chain().focus().toggleHighlight({ color: c }).run();
            }
          }}
          style={{
            width: 22, height: 22, borderRadius: 3,
            backgroundColor: c,
            border: c === '#ffffff' ? '1px solid #d9d9d9' : `1px solid ${c}`,
            cursor: 'pointer', boxSizing: 'border-box',
          }}
        />
      ))}
    </div>
  );
}

// ---------- 主组件 ----------
export default function RichTextEditor({ value, onChange, placeholder = '输入正文内容...' }) {
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const isInternalChange = useRef(false);
  const { message } = App.useApp();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      LinkExtension.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      ImageExtension.configure({ allowBase64: false, HTMLAttributes: { class: 'editor-image' } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder }),
    ],
    content: value, // 直接用 TipTap 内置的 content 属性接收外部值
    onUpdate: ({ editor: ed }) => {
      isInternalChange.current = true;
      const html = ed.getHTML();
      onChange?.(html);
    },
  });

  // 销毁时清理
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, []);

  if (!editor) return null;

  const isInTable = editor.isActive('table');

  // 表格操作菜单项（用 useMemo 避免每次渲染重建）
  const tableMenuItems = useMemo(() => [
    { key: 'row-above', icon: <InsertRowAboveOutlined />, label: '上方插入行', action: () => editor.chain().focus().addRowBefore().run() },
    { key: 'row-below', icon: <InsertRowBelowOutlined />, label: '下方插入行', action: () => editor.chain().focus().addRowAfter().run() },
    { key: 'delete-row', icon: <DeleteRowOutlined />, label: '删除当前行', action: () => editor.chain().focus().deleteRow().run() },
    { type: 'divider' },
    { key: 'col-left', icon: <InsertRowRightOutlined style={{ transform: 'rotate(180deg)' }} />, label: '左侧插入列', action: () => editor.chain().focus().addColumnBefore().run() },
    { key: 'col-right', icon: <InsertRowRightOutlined />, label: '右侧插入列', action: () => editor.chain().focus().addColumnAfter().run() },
    { key: 'delete-col', icon: <DeleteColumnOutlined />, label: '删除当前列', action: () => editor.chain().focus().deleteColumn().run() },
    { type: 'divider' },
    { key: 'toggle-header-row', icon: <BorderHorizontalOutlined />, label: '切换表头行', action: () => editor.chain().focus().toggleHeaderRow().run() },
    { key: 'delete-table', icon: <DeleteOutlined />, label: '删除整个表格', danger: true, action: () => editor.chain().focus().deleteTable().run() },
  ], [editor]);

  const handleTableInsert = useCallback((rows, cols, opts) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: opts.hasHeader }).run();
    setTableModalOpen(false);
  }, [editor]);

  const handleLinkSet = useCallback(() => {
    if (!linkUrl.trim()) return;
    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    }
    setLinkUrl('');
    setLinkModalOpen(false);
  }, [editor, linkUrl]);

  const handleRemoveLink = useCallback(() => {
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const handleImageSet = useCallback(() => {
    if (!imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    setImageUrl('');
    setImageModalOpen(false);
  }, [editor, imageUrl]);

  // 本地上传图片
  const handleLocalUpload = useCallback((file) => {
    setImageUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    client.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => {
      editor.chain().focus().setImage({ src: res.url }).run();
      setImageModalOpen(false);
    }).finally(() => {
      setImageUploading(false);
    });
    return false; // 阻止 Upload 默认行为
  }, [editor]);

  const headingValue = editor.isActive('heading', { level: 1 }) ? 'h1'
    : editor.isActive('heading', { level: 2 }) ? 'h2'
    : editor.isActive('heading', { level: 3 }) ? 'h3'
    : 'p';

  const handleHeadingChange = useCallback((val) => {
    if (val === 'p') {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(val.replace('h', ''), 10);
      editor.chain().focus().toggleHeading({ level }).run();
    }
  }, [editor]);

  return (
    <>
      {/* ===== 工具栏 ===== */}
      <div style={{
        border: '1px solid #d9d9d9', borderBottom: 'none',
        borderRadius: '6px 6px 0 0', padding: '8px 10px',
        background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {/* 行 1：文本格式 */}
        <Space wrap size={4}>
          <Select
            size="small"
            value={headingValue}
            onChange={handleHeadingChange}
            style={{ width: 80 }}
            options={[
              { value: 'p', label: '正文' },
              { value: 'h1', label: 'H1' },
              { value: 'h2', label: 'H2' },
              { value: 'h3', label: 'H3' },
            ]}
          />
          <Divider type="vertical" />
          <ToolButton icon={<BoldOutlined />} title="加粗 (Ctrl+B)" isActive={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
          <ToolButton icon={<ItalicOutlined />} title="斜体 (Ctrl+I)" isActive={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
          <ToolButton icon={<UnderlineOutlined />} title="下划线 (Ctrl+U)" isActive={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
          <ToolButton icon={<StrikethroughOutlined />} title="删除线" isActive={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
          <Divider type="vertical" />
          {/* 文字颜色 */}
          <Dropdown trigger={['click']} overlay={<ColorPicker editor={editor} type="text" />}>
            <Button size="small" icon={<FontColorsOutlined />} title="文字颜色" style={{ fontSize: 13 }} />
          </Dropdown>
          {/* 背景颜色 */}
          <Dropdown trigger={['click']} overlay={<ColorPicker editor={editor} type="highlight" />}>
            <Button size="small" icon={<BgColorsOutlined />} title="背景颜色" style={{ fontSize: 13 }} />
          </Dropdown>
          <Divider type="vertical" />
          <ToolButton icon={<ClearOutlined />} title="清除格式" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} />
        </Space>

        {/* 行 2：块结构 & 表格 */}
        <Space wrap size={4}>
          <ToolButton icon={<UnorderedListOutlined />} title="无序列表" isActive={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
          <ToolButton icon={<OrderedListOutlined />} title="有序列表" isActive={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
          <Divider type="vertical" />
          <ToolButton icon={<BlockOutlined />} title="引用" isActive={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
          <ToolButton icon={<CodeOutlined />} title="代码块" isActive={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
          <Divider type="vertical" />
          <ToolButton icon={<AlignLeftOutlined />} title="左对齐" isActive={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} />
          <ToolButton icon={<AlignCenterOutlined />} title="居中" isActive={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
          <ToolButton icon={<AlignRightOutlined />} title="右对齐" isActive={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} />
          <Divider type="vertical" />
          <Button
            size="small"
            icon={<LinkOutlined />}
            title="插入链接"
            onClick={() => {
              if (editor.isActive('link')) {
                handleRemoveLink();
              } else {
                const prev = editor.getAttributes('link')?.href || '';
                setLinkUrl(prev);
                setLinkModalOpen(true);
              }
            }}
            type={editor.isActive('link') ? 'primary' : 'default'}
            style={{ fontSize: 13 }}
          />
          <Button
            size="small"
            icon={<PictureOutlined />}
            title="插入图片"
            onClick={() => { setImageUrl(''); setImageModalOpen(true); }}
            style={{ fontSize: 13 }}
          />
          <Divider type="vertical" />
          <Button
            size="small"
            icon={<TableOutlined />}
            title="插入表格"
            onClick={() => setTableModalOpen(true)}
            style={{ fontSize: 13 }}
          />
          {isInTable && (
            <Dropdown
              trigger={['click']}
              menu={{
                items: tableMenuItems.map((item) => {
                  if (item.type === 'divider') return { type: 'divider' };
                  return {
                    key: item.key,
                    icon: item.icon,
                    label: item.label,
                    danger: item.danger,
                    onClick: item.action,
                  };
                }),
              }}
            >
              <Button size="small" icon={<TableOutlined />} type={isInTable ? 'primary' : 'default'} style={{ fontSize: 13 }}>
                表格操作
              </Button>
            </Dropdown>
          )}
        </Space>
      </div>

      {/* ===== 编辑区域 ===== */}
      <EditorContent editor={editor} className="tiptap-editor" />

      {/* ===== 插入表格弹窗 ===== */}
      <TableInsertModal open={tableModalOpen} onOk={handleTableInsert} onCancel={() => setTableModalOpen(false)} />

      {/* ===== 插入链接弹窗 ===== */}
      <Modal
        title={editor.isActive('link') ? '编辑链接' : '插入链接'}
        open={linkModalOpen}
        onOk={handleLinkSet}
        onCancel={() => { setLinkUrl(''); setLinkModalOpen(false); }}
        okText="确定"
        cancelText="取消"
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <span>链接地址</span>
          <InputNumber style={{ display: 'none' }} />
          <input
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleLinkSet(); }}
            style={{
              width: '100%', padding: '4px 11px', fontSize: 14, lineHeight: '30px',
              border: '1px solid #d9d9d9', borderRadius: 6, outline: 'none', boxSizing: 'border-box',
            }}
          />
          {editor.isActive('link') && (
            <Button danger size="small" onClick={() => { handleRemoveLink(); setLinkModalOpen(false); }}>移除链接</Button>
          )}
        </Space>
      </Modal>

      {/* ===== 插入图片弹窗 ===== */}
      <Modal
        title="插入图片"
        open={imageModalOpen}
        onOk={handleImageSet}
        onCancel={() => { setImageUrl(''); setImageModalOpen(false); }}
        okText="确定"
        cancelText="取消"
        width={480}
        footer={null}
      >
        <Tabs
          items={[
            {
              key: 'url',
              label: 'URL 插入',
              children: (
                <div style={{ paddingTop: 12 }}>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleImageSet(); }}
                    style={{
                      width: '100%', padding: '4px 11px', fontSize: 14, lineHeight: '30px',
                      border: '1px solid #d9d9d9', borderRadius: 6, outline: 'none', boxSizing: 'border-box',
                      marginBottom: 12,
                    }}
                  />
                  <Button type="primary" onClick={handleImageSet} disabled={!imageUrl.trim()} block>
                    插入图片
                  </Button>
                </div>
              ),
            },
            {
              key: 'upload',
              label: '本地上传',
              children: (
                <div style={{ paddingTop: 12 }}>
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={handleLocalUpload}
                  >
                    <Button icon={<UploadOutlined />} loading={imageUploading} block size="large" style={{ height: 80 }}>
                      {imageUploading ? '上传中...' : '点击上传本地图片'}
                    </Button>
                  </Upload>
                  <div style={{ textAlign: 'center', marginTop: 8, color: '#999', fontSize: 12 }}>
                    支持 JPG、PNG、GIF、WebP，最大 10MB
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
}
