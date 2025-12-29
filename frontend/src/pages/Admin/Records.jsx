import React, { useEffect, useState } from 'react'
import { Button, DatePicker, Drawer, Form, Input, InputNumber, message, Popconfirm, Select, Space, Table } from 'antd'
import http from '../../services/http'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function Records({ role }) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [filters, setFilters] = useState({ customerId: undefined, category: undefined, range: [] })
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form] = Form.useForm()

  const toISO = v => v ? dayjs(v).toDate().toISOString() : undefined

  const fetchList = async (p = page, s = size) => {
    setLoading(true)
    try {
      const params = {
        page: p, size: s,
        customerId: filters.customerId || undefined,
        category: filters.category || undefined,
        start: filters.range?.[0] ? toISO(filters.range[0]) : undefined,
        end: filters.range?.[1] ? toISO(filters.range[1]) : undefined
      }
      const resp = await http.get('/api/records', { params })
      setData(resp.list || [])
      setTotal(resp.total || 0)
      setPage(resp.page || p)
      setSize(resp.size || s)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchList() }, [])

  const onSearch = () => fetchList(1, size)

  const onCreate = () => {
    setEdit(null)
    form.resetFields()
    setOpen(true)
  }

  const onEdit = record => {
    setEdit(record)
    form.setFieldsValue({
      customerId: record.customerId,
      amount: record.amount,
      category: record.category,
      remark: record.remark,
      paidAt: dayjs(record.paidAt)
    })
    setOpen(true)
  }

  const onDelete = async id => {
    await http.delete(`/api/records/${id}`)
    message.success('删除成功')
    fetchList()
  }

  const onSubmit = async () => {
    const values = await form.validateFields()
    const payload = {
      customerId: values.customerId,
      amount: values.amount,
      category: values.category,
      remark: values.remark,
      paidAt: toISO(values.paidAt)
    }
    if (edit) {
      await http.put(`/api/records/${edit.id}`, payload)
      message.success('更新成功')
    } else {
      await http.post('/api/records', payload)
      message.success('创建成功')
    }
    setOpen(false)
    fetchList()
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '客户ID', dataIndex: 'customerId' },
    { title: '客户', dataIndex: 'customerName' },
    { title: '金额', dataIndex: 'amount' },
    { title: '分类', dataIndex: 'category' },
    { title: '备注', dataIndex: 'remark' },
    { title: '消费时间', dataIndex: 'paidAt' },
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
        <InputNumber placeholder="客户ID" value={filters.customerId} onChange={v => setFilters({ ...filters, customerId: v })} />
        <Select placeholder="分类" allowClear value={filters.category} onChange={v => setFilters({ ...filters, category: v })}
                options={[{ value: '餐饮', label: '餐饮' }, { value: '交通', label: '交通' }, { value: '购物', label: '购物' }, { value: '娱乐', label: '娱乐' }]} style={{ width: 160 }} />
        <RangePicker value={filters.range} onChange={v => setFilters({ ...filters, range: v })} showTime style={{ width: 360 }} />
        <Button type="primary" onClick={onSearch}>查询</Button>
        <Button onClick={onCreate} disabled={role !== 'admin'}>新增记录</Button>
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={data}
             pagination={{ current: page, pageSize: size, total, onChange: (p, s) => fetchList(p, s) }} />

      <Drawer open={open} onClose={() => setOpen(false)} title={edit ? '编辑消费记录' : '新增消费记录'} width={520}
              extra={<Space><Button onClick={() => setOpen(false)}>取消</Button><Button type="primary" onClick={onSubmit}>提交</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item label="客户ID" name="customerId" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="金额" name="amount" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0.01} step={0.01} /></Form.Item>
          <Form.Item label="分类" name="category" rules={[{ required: true }]}><Select
            options={[{ value: '餐饮', label: '餐饮' }, { value: '交通', label: '交通' }, { value: '购物', label: '购物' }, { value: '娱乐', label: '娱乐' }]} /></Form.Item>
          <Form.Item label="备注" name="remark"><Input /></Form.Item>
          <Form.Item label="消费时间" name="paidAt" rules={[{ required: true }]}><DatePicker showTime style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
