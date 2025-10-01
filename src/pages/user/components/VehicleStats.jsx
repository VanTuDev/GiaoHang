import React from "react";
import { CarOutlined, UserOutlined, ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Card, Statistic, Row, Col } from "antd";

const VehicleStats = ({
   totalVehicles = 0,
   onlineDrivers = 0,
   availableVehicles = 0,
   totalOrders = 0
}) => {
   return (
      <div className="mb-6">
         <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
               <Card>
                  <Statistic
                     title="Tổng số xe"
                     value={totalVehicles}
                     prefix={<CarOutlined className="text-blue-500" />}
                     valueStyle={{ color: '#1890ff' }}
                  />
               </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
               <Card>
                  <Statistic
                     title="Tài xế online"
                     value={onlineDrivers}
                     prefix={<UserOutlined className="text-green-500" />}
                     valueStyle={{ color: '#52c41a' }}
                  />
               </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
               <Card>
                  <Statistic
                     title="Xe có sẵn"
                     value={availableVehicles}
                     prefix={<EnvironmentOutlined className="text-orange-500" />}
                     valueStyle={{ color: '#fa8c16' }}
                  />
               </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
               <Card>
                  <Statistic
                     title="Đơn hàng hôm nay"
                     value={totalOrders}
                     prefix={<ClockCircleOutlined className="text-purple-500" />}
                     valueStyle={{ color: '#722ed1' }}
                  />
               </Card>
            </Col>
         </Row>
      </div>
   );
};

export default VehicleStats;
