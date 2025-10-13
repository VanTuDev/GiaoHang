import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
   ClockCircleOutlined,
   TruckOutlined,
   CheckCircleOutlined,
   DollarOutlined
} from '@ant-design/icons';
import { formatCurrency } from '../../../utils/formatters';

export default function OrderStats({ orders }) {
   // Tính số lượng đơn hàng theo trạng thái
   const countOrdersByStatus = (status) => {
      return orders.reduce((count, order) => {
         const hasItemWithStatus = order.items.some(item => item.status === status);
         return hasItemWithStatus ? count + 1 : count;
      }, 0);
   };

   // Tính tổng chi phí từ các đơn hàng đã giao
   const calculateTotalRevenue = () => {
      return orders.reduce((total, order) => {
         const hasDeliveredItems = order.items.some(item => item.status === "Delivered");
         if (hasDeliveredItems) {
            return total + order.totalPrice;
         }
         return total;
      }, 0);
   };

   const stats = [
      {
         title: "Đang chờ",
         value: countOrdersByStatus("Created"),
         icon: <ClockCircleOutlined />,
         color: "#f59e0b",
         bgColor: "from-yellow-500 to-orange-500"
      },
      {
         title: "Đang thực hiện",
         value: countOrdersByStatus("Accepted") + countOrdersByStatus("PickedUp") + countOrdersByStatus("Delivering"),
         icon: <TruckOutlined />,
         color: "#3b82f6",
         bgColor: "from-blue-500 to-indigo-500"
      },
      {
         title: "Hoàn thành",
         value: countOrdersByStatus("Delivered"),
         icon: <CheckCircleOutlined />,
         color: "#10b981",
         bgColor: "from-green-500 to-emerald-500"
      },
      {
         title: "Tổng chi phí",
         value: calculateTotalRevenue(),
         icon: <DollarOutlined />,
         color: "#8b5cf6",
         bgColor: "from-purple-500 to-violet-500",
         formatter: (v) => formatCurrency(v)
      }
   ];

   return (
      <Row gutter={[16, 16]}>
         {stats.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
               <Card
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}
                  styles={{ body: { padding: 0 } }}
               >
                  <div className={`bg-gradient-to-br ${stat.bgColor} p-6`}>
                     <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-white bg-opacity-30 rounded-xl flex items-center justify-center">
                           <div className="text-white text-2xl">{stat.icon}</div>
                        </div>
                     </div>
                     <div className="text-white">
                        <p className="text-sm opacity-90 mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold">
                           {stat.formatter ? stat.formatter(stat.value) : stat.value}
                        </p>
                     </div>
                  </div>
               </Card>
            </Col>
         ))}
      </Row>
   );
}

