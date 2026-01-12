import React, { useEffect, useState } from 'react'
import { Button, Drawer, Form, Input, message, Popconfirm, Select, Space, Table } from 'antd'
import http from '../../services/http'

export default function Locations({ role }) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form] = Form.useForm()

  const fetchList = async (p = page, s = size, k = keyword) => {
    setLoading(true)
    try {
      const resp = await http.get('/api/locations', { params: { page: p, size: s, keyword: k } })
      setData(resp.list || resp.records || [])
      setTotal(resp.total || 0)
      setPage(resp.page || p)
      setSize(resp.size || s)
    } catch (error) {
      console.error('获取地点列表失败:', error)
      message.error('获取地点列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchList() }, [])

  const onSearch = () => fetchList(1, size, keyword)

  const onCreate = () => {
    setEdit(null)
    form.resetFields()
    setOpen(true)
  }

  const onEdit = record => {
    setEdit(record)
    form.setFieldsValue({
      name: record.name,
      address: record.address,
      phone: record.phone,
      manager: record.manager,
      status: record.status,
      description: record.description
    })
    setOpen(true)
  }

  const onDelete = async id => {
    try {
      await http.delete(`/api/locations/${id}`)
      message.success('删除成功')
      fetchList()
    } catch (error) {
      console.error('删除失败:', error)
      message.error('删除失败')
    }
  }

  const onSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (edit) {
        await http.put(`/api/locations/${edit.id}`, values)
        message.success('更新成功')
      } else {
        await http.post('/api/locations', values)
        message.success('创建成功')
      }
      setOpen(false)
      fetchList()
    } catch (error) {
      console.error('提交失败:', error)
      message.error('提交失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '名称', dataIndex: 'name' },
    { title: '地址', dataIndex: 'address' },
    { title: '电话', dataIndex: 'phone' },
    { title: '负责人', dataIndex: 'manager' },
    { title: '状态', dataIndex: 'status' },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    {
      title: '操作',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => onEdit(record)} disabled={role !== 'admin'}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => onDelete(record.id)} disabled={role !== 'admin'}>
            <Button type="link" danger disabled={role !== 'admin'}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Input.Search placeholder="名称/地址/负责人" value={keyword} onChange={e => setKeyword(e.target.value)} onSearch={onSearch} allowClear style={{ width: 300 }} />
        <Button type="primary" onClick={onCreate} disabled={role !== 'admin'}>新增地点</Button>
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={data}
             pagination={{ current: page, pageSize: size, total, onChange: (p, s) => fetchList(p, s, keyword) }} />

      <Drawer open={open} onClose={() => setOpen(false)} title={edit ? '编辑地点' : '新增地点'} width={520}
              extra={<Space><Button onClick={() => setOpen(false)}>取消</Button><Button type="primary" onClick={onSubmit}>提交</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item label="名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="地址" name="address"><Input /></Form.Item>
          <Form.Item label="电话" name="phone"><Input /></Form.Item>
          <Form.Item label="负责人" name="manager"><Input /></Form.Item>
          <Form.Item label="状态" name="status">
            <Select options={[{ value: 'ACTIVE', label: '营业中' }, { value: 'INACTIVE', label: '已关闭' }]} />
          </Form.Item>
          <Form.Item label="描述" name="description"><Input.TextArea rows={4} /></Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}

