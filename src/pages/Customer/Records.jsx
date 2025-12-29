import React, { useEffect, useState } from 'react'
import { Button, DatePicker, Space, Table } from 'antd'
import http from '../../services/http'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function MyRecords() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [range, setRange] = useState([])

  const toISO = v => v ? dayjs(v).toDate().toISOString() : undefined

  const fetchList = async (p = page, s = size) => {
    setLoading(true)
    try {
      const params = {
        page: p, size: s,
        start: range?.[0] ? toISO(range[0]) : undefined,
        end: range?.[1] ? toISO(range[1]) : undefined
      }
      const resp = await http.get('/api/me/records', { params })
      setData(resp.list || [])
      setTotal(resp.total || 0)
      setPage(resp.page || p)
      setSize(resp.size || s)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchList() }, [])

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '金额', dataIndex: 'amount' },
    { title: '分类', dataIndex: 'category' },
    { title: '备注', dataIndex: 'remark' },
    { title: '消费时间', dataIndex: 'paidAt' }
  ]

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <RangePicker value={range} onChange={v => setRange(v)} showTime style={{ width: 360 }} />
        <Button type="primary" onClick={() => fetchList(1, size)}>查询</Button>
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={data}
             pagination={{ current: page, pageSize: size, total, onChange: (p, s) => fetchList(p, s) }} />
    </div>
  )
}
