# 消费管理系统（Ant Design + Spring Boot）

## 项目简介
- 管理员：客户管理（增删改查）、消费记录管理（增删改查）、统计报表
- 客户：查看消费记录
- 前后端分离，REST JSON 通信，图表使用 Apache ECharts
- 分层：controller → logic → service → dao → do → dto → vo

## 技术栈
- 前端：React、Ant Design、React Router、Axios、Apache ECharts
- 后端：Spring Boot 3、Spring Web、Spring Data（JPA 或 MyBatis）、MapStruct、Lombok
- 数据库：MySQL 8（UTF8MB4）

## 目录结构（建议）
```
frontend/
  src/
    pages/
      Admin/
        Customers/
        Records/
        Reports/
      Customer/
        Records/
    components/
      Table/
      Form/
      Chart/
    services/    # Axios 封装
    routes/      # 路由配置
backend/
  src/main/java/com/example/consumption/
    controller/
    logic/
    service/
    dao/
    domain/do/
    model/dto/
    model/vo/
    convert/
    config/
sql/
  init.sql
```

## 快速启动
### 1. 前置要求
- MySQL 8、JDK 17、Node.js 18、Maven 3.9+

### 2. 初始化数据库
- 打开 MySQL 客户端并执行：
```
SOURCE sql/init.sql;
```
- 完成后将生成数据库 consumption_mgmt、customers、consume_records，并写入示例数据

### 3. 后端服务
- 新建 Spring Boot 工程并添加依赖：Spring Web、数据访问（JPA 或 MyBatis）、Lombok、MapStruct
- 在 backend/src/main/resources/application.yml 配置数据源与 CORS：
```yaml
server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/consumption_mgmt?useUnicode=true&characterEncoding=utf8&serverTimezone=UTC
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jackson:
    time-zone: UTC
    date-format: yyyy-MM-dd HH:mm:ss
app:
  cors:
    origins: http://localhost:5173
```
- 启动：
```
mvn clean spring-boot:run
```
- 约定接口（示例）：
  - GET /api/customers?page=&size=&keyword=
  - POST /api/customers
  - PUT /api/customers/{id}
  - DELETE /api/customers/{id}
  - GET /api/records?page=&size=&customerId=&category=&start=&end=
  - POST /api/records
  - PUT /api/records/{id}
  - DELETE /api/records/{id}
  - GET /api/stats/monthly?year=
  - GET /api/stats/category?start=&end=

### 4. 前端应用
- 在 frontend 目录安装依赖并启动：
```
npm i
npm run dev
```
- 在 .env.development 配置接口地址：
```
VITE_API_BASE=http://localhost:8080
```
- 访问：
  - 管理员页面：http://localhost:5173/admin/customers
  - 客户页面：http://localhost:5173/customer/records

## 页面说明
- 管理员
  - 客户管理：表格 + 搜索 + 新增/编辑抽屉 + 删除
  - 消费记录管理：表格 + 筛选（客户、分类、时间）+ 新增/编辑 + 删除
  - 统计报表：月度消费趋势（柱状/折线）、分类占比（饼图）
- 客户
  - 我的消费记录：表格 + 时间范围筛选

## 图表展示（Apache ECharts）
- 统一封装 Chart 组件：
```
<Chart options={options} style={{height: 360}} />
```
- 示例 options（分类占比）：
```json
{
  "tooltip": {"trigger": "item"},
  "series": [{
    "type": "pie",
    "radius": "60%",
    "data": [
      {"name": "餐饮", "value": 449.0},
      {"name": "购物", "value": 1719.0},
      {"name": "交通", "value": 149.5},
      {"name": "娱乐", "value": 120.0}
    ]
  }]
}
```

## 开发约定
- DTO：创建/更新入参（如 CreateCustomerDto、UpdateRecordDto）
- DO：数据库实体（customers、consume_records）
- VO：HTTP 输出（如 CustomerVO、RecordVO、MonthlyStatVO、CategoryStatVO）
- controller 收 DTO → logic 调度 → service 处理领域 → dao 读写 DO → convert 映射 VO 返回
- 校验：Jakarta Validation；分页统一 PageRequest、PageResult；统一错误返回 {code,message}

## 迭代建议
- 第一步：后端搭建分层骨架与基础接口
- 第二步：前端页面与路由搭建、打通基础接口
- 第三步：统计报表聚合与渲染
- 第四步：联调与优化（索引、边界用例、体验）
