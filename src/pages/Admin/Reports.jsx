import React, { useEffect, useState } from 'react'
import { Card, DatePicker, InputNumber, Space } from 'antd'
import http from '../../services/http'
import Chart from '../../components/Chart.jsx'
import dayjs from 'dayjs'

export default function Reports() {
  const [year, setYear] = useState(dayjs().year())
  const [range, setRange] = useState([])
  const [monthly, setMonthly] = useState([])
  const [category, setCategory] = useState([])

  const fetchMonthly = async () => {
    const resp = await http.get('/api/stats/monthly', { params: { year } })
    setMonthly(resp || [])
  }

  const fetchCategory = async () => {
    const params = {
      start: range?.[0] ? dayjs(range[0]).toDate().toISOString() : undefined,
      end: range?.[1] ? dayjs(range[1]).toDate().toISOString() : undefined
    }
    const resp = await http.get('/api/stats/category', { params })
    setCategory(resp || [])
  }

  useEffect(() => { fetchMonthly() }, [year])
  useEffect(() => { fetchCategory() }, [range])

  const monthlyOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: (monthly || []).map(i => i.month) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: (monthly || []).map(i => i.value) }]
  }

  const categoryOption = {
    tooltip: { trigger: 'item' },
    series: [{ type: 'pie', radius: '60%', data: (category || []).map(i => ({ name: i.category, value: i.value })) }]
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Card title="月度消费趋势">
        <Space style={{ marginBottom: 12 }}>
          <span>年份</span>
          <InputNumber value={year} onChange={setYear} min={2000} max={2100} />
        </Space>
        <Chart options={monthlyOption} />
      </Card>
      <Card title="分类占比">
        <Space style={{ marginBottom: 12 }}>
          <span>时间范围</span>
          <DatePicker.RangePicker value={range} onChange={v => setRange(v)} showTime />
        </Space>
        <Chart options={categoryOption} />
      </Card>
    </Space>
  )
}
