import React, { useState, useEffect } from 'react';
import { List, Card, Input, Button, Modal, message, Typography, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

const StyledCard = styled(Card)`
  margin-bottom: 16px;
  .ant-card-body {
    padding: 16px;
  }
`;

const NoteContent = styled.div`
  max-height: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Tag = styled.span`
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
`;

const NotesComponent: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    // 從 localStorage 加載筆記
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  useEffect(() => {
    // 保存筆記到 localStorage
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsModalVisible(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalVisible(true);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    message.success('筆記已刪除');
  };

  const handleModalOk = (values: any) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    if (editingNote) {
      // 更新現有筆記
      setNotes(notes.map(note =>
        note.id === editingNote.id
          ? {
            ...note,
            ...values,
            updatedAt: now,
            tags: values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
          }
          : note
      ));
      message.success('筆記已更新');
    } else {
      // 創建新筆記
      const newNote: Note = {
        id: Date.now().toString(),
        title: values.title,
        content: values.content,
        createdAt: now,
        updatedAt: now,
        tags: values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      };
      setNotes([newNote, ...notes]);
      message.success('筆記已創建');
    }
    setIsModalVisible(false);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchText.toLowerCase()) ||
      note.content.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => note.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索筆記..."
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Space wrap>
          {allTags.map(tag => (
            <Button
              key={tag}
              type={selectedTags.includes(tag) ? 'primary' : 'default'}
              onClick={() => {
                setSelectedTags(prev =>
                  prev.includes(tag)
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                );
              }}
            >
              {tag}
            </Button>
          ))}
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateNote}>
          新建筆記
        </Button>
      </Space>

      <List
        dataSource={filteredNotes}
        renderItem={note => (
          <StyledCard
            actions={[
              <EditOutlined key="edit" onClick={() => handleEditNote(note)} />,
              <Popconfirm
                title="確定要刪除這個筆記嗎？"
                onConfirm={() => handleDeleteNote(note.id)}
                okText="確定"
                cancelText="取消"
              >
                <DeleteOutlined key="delete" />
              </Popconfirm>
            ]}
          >
            <Title level={4}>{note.title}</Title>
            <NoteContent>
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </NoteContent>
            <Text type="secondary">
              更新於 {dayjs(note.updatedAt).format('YYYY-MM-DD HH:mm')}
            </Text>
            <TagContainer>
              {note.tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </TagContainer>
          </StyledCard>
        )}
      />

      <Modal
        title={editingNote ? '編輯筆記' : '新建筆記'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleModalOk({
              title: formData.get('title'),
              content: formData.get('content'),
              tags: formData.get('tags')
            });
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              name="title"
              placeholder="標題"
              defaultValue={editingNote?.title}
              required
            />
            <TextArea
              name="content"
              placeholder="內容（支持 Markdown 格式）"
              rows={6}
              defaultValue={editingNote?.content}
              required
            />
            <Input
              name="tags"
              placeholder="標籤（用逗號分隔）"
              defaultValue={editingNote?.tags.join(', ')}
            />
            <Button type="primary" htmlType="submit">
              {editingNote ? '更新' : '創建'}
            </Button>
          </Space>
        </form>
      </Modal>
    </div>
  );
};

export default NotesComponent;
