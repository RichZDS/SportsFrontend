import React, { useEffect, useState } from 'react'
import { Button, Drawer, Form, Input, message, Popconfirm, Space, Table } from 'antd'
import http from '../../services/http'

export default function Customers({ role }) {
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
      const resp = await http.get('/api/customers', { params: { page: p, size: s, keyword: k } })
      setData(resp.list || [])
      setTotal(resp.total || 0)
      setPage(resp.page || p)
      setSize(resp.size || s)
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
    form.setFieldsValue({ name: record.name, phone: record.phone, email: record.email, status: record.status })
    setOpen(true)
  }

  const onDelete = async id => {
    await http.delete(`/api/customers/${id}`)
    message.success('删除成功')
    fetchList()
  }

  const onSubmit = async () => {
    const values = await form.validateFields()
    if (edit) {
      const resp = await http.put(`/api/customers/${edit.id}`, values)
      message.success('更新成功')
    } else {
      const resp = await http.post('/api/customers', values)
      message.success('创建成功')
    }
    setOpen(false)
    fetchList()
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '姓名', dataIndex: 'name' },
    { title: '电话', dataIndex: 'phone' },
    { title: '邮箱', dataIndex: 'email' },
    { title: '状态', dataIndex: 'status' },
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
        <Input.Search placeholder="姓名/电话/邮箱" value={keyword} onChange={e => setKeyword(e.target.value)} onSearch={onSearch} allowClear style={{ width: 300 }} />
        <Button type="primary" onClick={onCreate} disabled={role !== 'admin'}>新增客户</Button>
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={data}
             pagination={{ current: page, pageSize: size, total, onChange: (p, s) => fetchList(p, s, keyword) }} />

      <Drawer open={open} onClose={() => setOpen(false)} title={edit ? '编辑客户' : '新增客户'} width={420}
              extra={<Space><Button onClick={() => setOpen(false)}>取消</Button><Button type="primary" onClick={onSubmit}>提交</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item label="姓名" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="电话" name="phone"><Input /></Form.Item>
          <Form.Item label="邮箱" name="email"><Input /></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true }]}><Input placeholder="ACTIVE/INACTIVE" /></Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
