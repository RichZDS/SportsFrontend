import React, { useEffect, useState } from 'react'
import { Button, DatePicker, Drawer, Form, Input, InputNumber, message, Popconfirm, Select, Space, Table } from 'antd'
import http from '../../services/http'
import dayjs from 'dayjs'

export default function Courses({ role }) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(null)
  const [trainers, setTrainers] = useState([])
  const [form] = Form.useForm()

  const fetchTrainers = async () => {
    try {
      const resp = await http.get('/api/trainers', { params: { page: 1, size: 1000 } })
      setTrainers(resp.list || resp.records || [])
    } catch (error) {
      console.error('获取教练列表失败:', error)
    }
  }

  const fetchList = async (p = page, s = size, k = keyword) => {
    setLoading(true)
    try {
      const resp = await http.get('/api/courses', { params: { page: p, size: s, keyword: k } })
      setData(resp.list || resp.records || [])
      setTotal(resp.total || 0)
      setPage(resp.page || p)
      setSize(resp.size || s)
    } catch (error) {
      console.error('获取课程列表失败:', error)
      message.error('获取课程列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrainers()
    fetchList()
  }, [])

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
      trainerId: record.trainerId,
      description: record.description,
      durationMinutes: record.durationMinutes,
      maxParticipants: record.maxParticipants,
      price: record.price,
      scheduleTime: record.scheduleTime ? dayjs(record.scheduleTime) : null,
      status: record.status
    })
    setOpen(true)
  }

  const onDelete = async id => {
    try {
      await http.delete(`/api/courses/${id}`)
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
        scheduleTime: values.scheduleTime ? values.scheduleTime.toISOString() : null
      }
      if (edit) {
        await http.put(`/api/courses/${edit.id}`, payload)
        message.success('更新成功')
      } else {
        await http.post('/api/courses', payload)
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
    { title: '课程名称', dataIndex: 'name' },
    { title: '教练', dataIndex: 'trainerName' },
    { title: '时长(分钟)', dataIndex: 'durationMinutes' },
    { title: '最大人数', dataIndex: 'maxParticipants' },
    { title: '价格', dataIndex: 'price', render: v => v ? `¥${v}` : '-' },
    { title: '课程时间', dataIndex: 'scheduleTime', render: v => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
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
        <Input.Search placeholder="课程名称/描述" value={keyword} onChange={e => setKeyword(e.target.value)} onSearch={onSearch} allowClear style={{ width: 300 }} />
        <Button type="primary" onClick={onCreate} disabled={role !== 'admin'}>新增课程</Button>
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={data}
             pagination={{ current: page, pageSize: size, total, onChange: (p, s) => fetchList(p, s, keyword) }} />

      <Drawer open={open} onClose={() => setOpen(false)} title={edit ? '编辑课程' : '新增课程'} width={520}
              extra={<Space><Button onClick={() => setOpen(false)}>取消</Button><Button type="primary" onClick={onSubmit}>提交</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item label="课程名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="教练" name="trainerId">
            <Select allowClear options={trainers.map(t => ({ value: t.id, label: t.name }))} />
          </Form.Item>
          <Form.Item label="描述" name="description"><Input.TextArea rows={4} /></Form.Item>
          <Form.Item label="时长(分钟)" name="durationMinutes" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} /></Form.Item>
          <Form.Item label="最大人数" name="maxParticipants" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} /></Form.Item>
          <Form.Item label="价格" name="price" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
          <Form.Item label="课程时间" name="scheduleTime" rules={[{ required: true }]}><DatePicker showTime style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="状态" name="status">
            <Select options={[{ value: 'ACTIVE', label: '有效' }, { value: 'INACTIVE', label: '无效' }]} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}




