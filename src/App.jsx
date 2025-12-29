import React, { useState } from 'react'
import { Layout, Menu, Select } from 'antd'
import { Link, Routes, Route, useLocation } from 'react-router-dom'
import Customers from './pages/Admin/Customers.jsx'
import Records from './pages/Admin/Records.jsx'
import Reports from './pages/Admin/Reports.jsx'
import MyRecords from './pages/Customer/Records.jsx'

const { Header, Sider, Content } = Layout

export default function App() {
  const [role, setRole] = useState('admin')
  const location = useLocation()
  const selectedKeys = [location.pathname]
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220}>
        <div style={{ color: '#fff', padding: 16, fontWeight: 600 }}>消费管理系统</div>
        <Menu theme="dark" mode="inline" selectedKeys={selectedKeys} items={[
          { key: '/admin/customers', label: <Link to="/admin/customers">客户管理</Link> },
          { key: '/admin/records', label: <Link to="/admin/records">消费记录管理</Link> },
          { key: '/admin/reports', label: <Link to="/admin/reports">统计报表</Link> },
          { key: '/customer/records', label: <Link to="/customer/records">我的消费记录</Link> }
        ]} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          <span>角色</span>
          <Select value={role} onChange={setRole} options={[
            { value: 'admin', label: '管理员' },
            { value: 'customer', label: '客户' }
          ]} style={{ width: 140 }} />
        </Header>
        <Content style={{ margin: 16, background: '#fff', padding: 16 }}>
          <Routes>
            <Route path="/admin/customers" element={<Customers role={role} />} />
            <Route path="/admin/records" element={<Records role={role} />} />
            <Route path="/admin/reports" element={<Reports role={role} />} />
            <Route path="/customer/records" element={<MyRecords role={role} />} />
            <Route path="*" element={<Customers role={role} />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}
