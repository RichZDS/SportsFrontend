import React, { useEffect, useState } from 'react'
import { Button, DatePicker, Drawer, Form, Input, InputNumber, message, Popconfirm, Select, Space, Table } from 'antd'
import http from '../../services/http'
import dayjs from 'dayjs'

export default function Employees({ role }) {
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
      const resp = await http.get('/api/employees', { params: { page: p, size: s, keyword: k } })
      setData(resp.list || resp.records || [])
      setTotal(resp.total || 0)
      setPage(resp.page || p)
      setSize(resp.size || s)
    } catch (error) {
      console.error('获取员工列表失败:', error)
      message.error('获取员工列表失败')
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
      phone: record.phone,
      email: record.email,
      position: record.position,
      status: record.status,
      salary: record.salary,
      hiredAt: record.hiredAt ? dayjs(record.hiredAt) : undefined
    })
    setOpen(true)
  }

  const onDelete = async id => {
    try {
      await http.delete(`/api/employees/${id}`)
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
      const payload = {
        ...values,
        hiredAt: values.hiredAt ? values.hiredAt.toISOString() : undefined
      }
      if (edit) {
        await http.put(`/api/employees/${edit.id}`, payload)
        message.success('更新成功')
      } else {
        await http.post('/api/employees', payload)
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
    { title: '姓名', dataIndex: 'name' },
    { title: '电话', dataIndex: 'phone' },
    { title: '邮箱', dataIndex: 'email' },
    { title: '职位', dataIndex: 'position' },
    { title: '状态', dataIndex: 'status' },
    { title: '薪资', dataIndex: 'salary', render: v => v ? `¥${v}` : '-' },
    { title: '入职时间', dataIndex: 'hiredAt', render: v => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
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
        <Input.Search placeholder="姓名/电话/邮箱/职位" value={keyword} onChange={e => setKeyword(e.target.value)} onSearch={onSearch} allowClear style={{ width: 300 }} />
        <Button type="primary" onClick={onCreate} disabled={role !== 'admin'}>新增员工</Button>
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={data}
             pagination={{ current: page, pageSize: size, total, onChange: (p, s) => fetchList(p, s, keyword) }} />

      <Drawer open={open} onClose={() => setOpen(false)} title={edit ? '编辑员工' : '新增员工'} width={520}
              extra={<Space><Button onClick={() => setOpen(false)}>取消</Button><Button type="primary" onClick={onSubmit}>提交</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item label="姓名" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="电话" name="phone"><Input /></Form.Item>
          <Form.Item label="邮箱" name="email"><Input /></Form.Item>
          <Form.Item label="职位" name="position" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="状态" name="status">
            <Select options={[{ value: 'ACTIVE', label: '在职' }, { value: 'INACTIVE', label: '离职' }]} />
          </Form.Item>
          <Form.Item label="薪资" name="salary"><InputNumber style={{ width: '100%' }} min={0} step={100} /></Form.Item>
          <Form.Item label="入职时间" name="hiredAt">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}

