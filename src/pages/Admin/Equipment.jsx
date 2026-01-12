import React, { useEffect, useState } from 'react'
import { Button, DatePicker, Drawer, Form, Input, InputNumber, message, Popconfirm, Select, Space, Table } from 'antd'
import http from '../../services/http'
import dayjs from 'dayjs'

export default function Equipment({ role }) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState(undefined)
  const [status, setStatus] = useState(undefined)
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form] = Form.useForm()

  const fetchList = async (p = page, s = size, k = keyword, c = category, st = status) => {
    setLoading(true)
    try {
      const params = { page: p, size: s }
      if (k) params.keyword = k
      if (c) params.category = c
      if (st) params.status = st
      const resp = await http.get('/api/equipment', { params })
      setData(resp.list || resp.records || [])
      setTotal(resp.total || 0)
      setPage(resp.page || p)
      setSize(resp.size || s)
    } catch (error) {
      console.error('获取器材列表失败:', error)
      message.error('获取器材列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchList() }, [])

  const onSearch = () => fetchList(1, size, keyword, category, status)

  const onCreate = () => {
    setEdit(null)
    form.resetFields()
    setOpen(true)
  }

  const onEdit = record => {
    setEdit(record)
    form.setFieldsValue({
      name: record.name,
      category: record.category,
      brand: record.brand,
      model: record.model,
      purchaseDate: record.purchaseDate ? dayjs(record.purchaseDate) : null,
      purchasePrice: record.purchasePrice,
      status: record.status,
      location: record.location,
      maintenanceDate: record.maintenanceDate ? dayjs(record.maintenanceDate) : null
    })
    setOpen(true)
  }

  const onDelete = async id => {
    try {
      await http.delete(`/api/equipment/${id}`)
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
        purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : null,
        maintenanceDate: values.maintenanceDate ? values.maintenanceDate.format('YYYY-MM-DD') : null
      }
      if (edit) {
        await http.put(`/api/equipment/${edit.id}`, payload)
        message.success('更新成功')
      } else {
        await http.post('/api/equipment', payload)
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
    { title: '分类', dataIndex: 'category' },
    { title: '品牌', dataIndex: 'brand' },
    { title: '型号', dataIndex: 'model' },
    { title: '状态', dataIndex: 'status' },
    { title: '位置', dataIndex: 'location' },
    { title: '采购价格', dataIndex: 'purchasePrice', render: v => v ? `¥${v}` : '-' },
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
        <Input.Search placeholder="名称/品牌/型号" value={keyword} onChange={e => setKeyword(e.target.value)} onSearch={onSearch} allowClear style={{ width: 300 }} />
        <Select placeholder="分类" allowClear value={category} onChange={setCategory} style={{ width: 120 }}
                options={[{ value: '有氧器械', label: '有氧器械' }, { value: '力量器械', label: '力量器械' }, { value: '辅助器械', label: '辅助器械' }]} />
        <Select placeholder="状态" allowClear value={status} onChange={setStatus} style={{ width: 120 }}
                options={[{ value: 'AVAILABLE', label: '可用' }, { value: 'UNAVAILABLE', label: '不可用' }, { value: 'MAINTENANCE', label: '维护中' }]} />
        <Button type="primary" onClick={onSearch}>查询</Button>
        <Button onClick={onCreate} disabled={role !== 'admin'}>新增器材</Button>
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={data}
             pagination={{ current: page, pageSize: size, total, onChange: (p, s) => fetchList(p, s, keyword, category, status) }} />

      <Drawer open={open} onClose={() => setOpen(false)} title={edit ? '编辑器材' : '新增器材'} width={520}
              extra={<Space><Button onClick={() => setOpen(false)}>取消</Button><Button type="primary" onClick={onSubmit}>提交</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item label="名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="分类" name="category" rules={[{ required: true }]}>
            <Select options={[{ value: '有氧器械', label: '有氧器械' }, { value: '力量器械', label: '力量器械' }, { value: '辅助器械', label: '辅助器械' }]} />
          </Form.Item>
          <Form.Item label="品牌" name="brand"><Input /></Form.Item>
          <Form.Item label="型号" name="model"><Input /></Form.Item>
          <Form.Item label="采购日期" name="purchaseDate"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="采购价格" name="purchasePrice"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
          <Form.Item label="状态" name="status">
            <Select options={[{ value: 'AVAILABLE', label: '可用' }, { value: 'UNAVAILABLE', label: '不可用' }, { value: 'MAINTENANCE', label: '维护中' }]} />
          </Form.Item>
          <Form.Item label="位置" name="location"><Input /></Form.Item>
          <Form.Item label="维护日期" name="maintenanceDate"><DatePicker style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}




