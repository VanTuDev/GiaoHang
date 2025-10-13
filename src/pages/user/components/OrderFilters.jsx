import React from 'react';
import { Row, Col, Input, Select, Button } from 'antd';
import {
   SearchOutlined,
   FilterOutlined
} from '@ant-design/icons';

export default function OrderFilters({
   searchTerm,
   setSearchTerm,
   statusFilter,
   setStatusFilter,
   filteredCount
}) {
   return (
      <Row gutter={[16, 16]} className="mb-6">
         <Col xs={24} md={10}>
            <Input
               placeholder="Tìm kiếm theo mã đơn, địa chỉ..."
               prefix={<SearchOutlined className="text-gray-400" />}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               allowClear
               size="large"
               className="rounded-lg"
            />
         </Col>
         <Col xs={24} md={10}>
            <Select
               value={statusFilter}
               onChange={setStatusFilter}
               style={{ width: "100%" }}
               placeholder="Lọc theo trạng thái"
               size="large"
               className="rounded-lg"
            >
               <Select.Option value="all">
                  <span className="font-medium">Tất cả trạng thái</span>
               </Select.Option>
               <Select.Option value="Created">
                  <span className="flex items-center">
                     <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                     Đang tìm tài xế
                  </span>
               </Select.Option>
               <Select.Option value="Accepted">
                  <span className="flex items-center">
                     <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                     Đã có tài xế
                  </span>
               </Select.Option>
               <Select.Option value="PickedUp">
                  <span className="flex items-center">
                     <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                     Đã lấy hàng
                  </span>
               </Select.Option>
               <Select.Option value="Delivering">
                  <span className="flex items-center">
                     <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                     Đang giao
                  </span>
               </Select.Option>
               <Select.Option value="Delivered">
                  <span className="flex items-center">
                     <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                     Đã giao
                  </span>
               </Select.Option>
               <Select.Option value="Cancelled">
                  <span className="flex items-center">
                     <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                     Đã hủy
                  </span>
               </Select.Option>
            </Select>
         </Col>
         <Col xs={24} md={4}>
            <Button
               type="primary"
               icon={<FilterOutlined />}
               size="large"
               block
               className="bg-gradient-to-r from-blue-500 to-blue-600 border-none hover:from-blue-600 hover:to-blue-700 rounded-lg font-medium"
            >
               Kết quả ({filteredCount})
            </Button>
         </Col>
      </Row>
   );
}

