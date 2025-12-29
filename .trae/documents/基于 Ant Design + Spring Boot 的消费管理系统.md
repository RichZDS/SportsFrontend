## 项目概述

* 角色：管理员（客户管理、消费记录管理、统计报表），客户（查看消费记录）

* 前端：React + Ant Design + React Router + Axios + Apache ECharts

* 后端：Spring Boot 3 + Spring Web + Spring Data（JPA 或 MyBatis）+ MapStruct（DTO/VO 映射）+ Lombok

* 数据库：MySQL 8，单库单 schema，UTF8MB4

* 分层：controller → logic → service → dao → do → dto → vo

## 技术栈与目录结构

* 前端工程：frontend

  * src/pages/Admin/Customers、Admin/Records、Admin/Reports、Customer/Records

  * 共享组件：components/Table、Form、Chart（ECharts 封装）

  * 路由：/admin/customers、/admin/records、/admin/reports、/customer/records

* 后端工程：backend（Maven）

  * 包结构：

    * controller：入参校验，VO 输出

    * logic：跨服务编排、事务边界

    * service：领域服务，业务规则

    * dao：数据访问（JPA Repository 或 MyBatis Mapper）

    * domain.do：数据库实体

    * model.dto：DTO（入参/出参内部交换）

    * model.vo：VO（HTTP 输出）

    * convert：MapStruct 映射器

    * config：CORS、异常处理、Jackson、数据库

* 通信方式：REST JSON，Axios 封装请求，统一错误处理

* 图表：Apache ECharts，封装 Chart 组件，按需传入 options

## 数据库与 SQL（一次性建表与示例数据）

* 库名：consumption\_mgmt

* 表：

  * customers：客户基本信息

  * consume\_records：消费记录

* 初始数据：3 个客户，若干条跨月份消费记录（分类与金额）

```sql
CREATE DATABASE IF NOT EXISTS consumption_mgmt DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE consumption_mgmt;

DROP TABLE IF EXISTS consume_records;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) NOT NULL,
  phone VARCHAR(20) NULL,
  email VARCHAR(128) NULL,
  status VARCHAR(16) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE consume_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(32) NOT NULL,
  remark VARCHAR(255) NULL,
  paid_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_customer_paid_at (customer_id, paid_at),
  CONSTRAINT fk_consume_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO customers (name, phone, email, status, created_at, updated_at) VALUES
('张三', '13800000001', 'zhangsan@example.com', 'ACTIVE', NOW(), NOW()),
('李四', '13800000002', 'lisi@example.com', 'ACTIVE', NOW(), NOW()),
('王五', '13800000003', 'wangwu@example.com', 'INACTIVE', NOW(), NOW());

INSERT INTO consume_records (customer_id, amount, category, remark, paid_at, created_at, updated_at) VALUES
(1, 199.00, '餐饮', '午餐', '2025-01-08 12:30:00', NOW(), NOW()),
(1, 58.50, '交通', '地铁', '2025-01-15 08:10:00', NOW(), NOW()),
(1, 899.00, '购物', '外套', '2025-02-03 16:45:00', NOW(), NOW()),
(1, 35.00, '餐饮', '早餐', '2025-02-10 09:00:00', NOW(), NOW()),
(1, 120.00, '娱乐', '电影', '2025-03-02 20:00:00', NOW(), NOW()),
(2, 20.00, '餐饮', '咖啡', '2025-01-09 10:00:00', NOW(), NOW()),
(2, 320.00, '购物', '运动鞋', '2025-01-20 14:00:00', NOW(), NOW()),
(2, 66.00, '交通', '打车', '2025-02-11 22:00:00', NOW(), NOW()),
(2, 45.00, '餐饮', '晚餐', '2025-03-05 19:00:00', NOW(), NOW()),
(3, 150.00, '餐饮', '聚餐', '2025-01-05 18:00:00', NOW(), NOW()),
(3, 500.00, '购物', '家电配件', '2025-02-18 11:00:00', NOW(), NOW()),
(3, 25.00, '交通', '公交', '2025-03-10 08:30:00', NOW(), NOW());
```

## 后端接口设计

* 客户管理

  * GET /api/customers?page=\&size=\&keyword=

  * POST /api/customers

  * PUT /api/customers/{id}

  * DELETE /api/customers/{id}

* 消费记录管理

  * GET /api/records?page=\&size=\&customerId=\&category=\&start=\&end=

  * POST /api/records

  * PUT /api/records/{id}

  * DELETE /api/records/{id}

* 统计报表

  * GET /api/stats/monthly?year=

  * GET /api/stats/category?start=\&end=

* 客户侧

  * GET /api/me/records?page=\&size=\&start=\&end=

## 分层约定（DO/DTO/VO）

* DO：customers、consume\_records 数据库实体

* DTO：创建/更新入参，如 CreateCustomerDto、UpdateRecordDto

* VO：HTTP 输出，如 CustomerVO、RecordVO、MonthlyStatVO、CategoryStatVO

* 映射规则：Controller 收 DTO → Logic 调用 Service → DAO 读写 DO → MapStruct 转 VO 返回

## 前端功能与路由

* 管理员：

  * 客户管理：表格 + 搜索 + 新增/编辑抽屉 + 删除

  * 消费记录管理：表格 + 筛选（客户、分类、时间）+ 新增/编辑 + 删除

  * 统计报表：

    * 月度消费趋势（折线/柱状）

    * 分类占比（饼图）

* 客户：

  * 我的消费记录：表格 + 时间范围筛选

* 统一布局：Ant Layout + Menu；路由守卫可先用前端开关模拟角色

## 图表展示（ECharts）

* 封装 Chart 组件：\<Chart options={...} style={{height: 360}} />

* 月度趋势 options 示例：

```json
{
  "tooltip": {"trigger": "axis"},
  "xAxis": {"type": "category", "data": ["1月", "2月", "3月"]},
  "yAxis": {"type": "value"},
  "series": [{"type": "bar", "data": [1377.5, 1490.0, 190.0]}]
}
```

* 分类占比 options 示例：

```json
{
  "tooltip": {"trigger": "item"},
  "series": [{"type": "pie", "radius": "60%", "data": [
    {"name": "餐饮", "value": 449.0},
    {"name": "购物", "value": 1719.0},
    {"name": "交通", "value": 149.5},
    {"name": "娱乐", "value": 120.0}
  ]}]
}
```

## 快速启动（README 提纲）

* 前置要求：

  * MySQL 8、JDK 17、Node.js 18、Maven 3.9+

* 数据库：

  * 创建库并执行 sql/init.sql（以上 SQL）

* 后端：

  * 配置 src/main/resources/application.yml：

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
  mvc:
    pathmatch:
      matching-strategy: ant_path_matcher

app:
  cors:
    origins: http://localhost:5173
```

* 启动：mvn clean spring-boot:run

* 前端：

  * 安装依赖：npm i

  * 本地开发：npm run dev（默认 <http://localhost:5173）>

  * 接口地址：在 .env.development 配置 VITE\_API\_BASE=<http://localhost:8080>

* 访问：

  * 管理员页面：<http://localhost:5173/admin/customers>

  * 客户页面：<http://localhost:5173/customer/records>

## 开发要点

* 校验：后端使用 Jakarta Validation 注解校验 DTO；前端表单使用 Ant Form.Item 规则

* 事务：Logic 层界定事务；Service 内部方法保持幂等

* 分页：统一 PageRequest 与 PageResult VO；前端分页与筛选参数统一

* 错误处理：后端统一异常返回 {code,message}; 前端全局拦截器提示

* CORS：开放前端域；生产环境收敛为实际域名

## 迭代与联调

* 第一步：后端搭骨架（分层与实体、DAO、基础接口）

* 第二步：前端页面与路由、与接口打通

* 第三步：统计报表聚合 SQL 与接口、ECharts 渲染

* 第四步：验收与优化（缓存、索引、边界用例）

使用swagger 前端使用后端产生的swagger接口

## 确认

请确认以上方案。我将据此生成 SQL 文件与完整 README，创建前后端骨架（按 MVC 分层：controller/logic/service/dao/do/dto/vo），接入 ECharts 并完成联调。
