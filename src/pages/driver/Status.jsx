import React, { useState, useEffect } from 'react';
import { Card, Switch, Alert, Button, Spin, Statistic, Row, Col, Divider, Checkbox, message } from 'antd';
import {
   CheckCircleOutlined,
   CloseCircleOutlined,
   CarOutlined,
   ClockCircleOutlined,
   DollarCircleOutlined,
   StarOutlined,
   EnvironmentOutlined
} from '@ant-design/icons';
import { orderService } from '../../features/orders/api/orderService';
import { vehicleService } from '../../features/vehicles/api/vehicleService';
import { driverService } from '../../features/driver/api/driverService';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export default function DriverStatus() {
   const navigate = useNavigate();
   const [isOnline, setIsOnline] = useState(false);
   const [loading, setLoading] = useState(true);
   const [updating, setUpdating] = useState(false);
   const [error, setError] = useState(null);
   const [vehicles, setVehicles] = useState([]);
   const [stats, setStats] = useState({
      totalTrips: 0,
      rating: 5.0,
      earnings: 0
   });
   const [districts, setDistricts] = useState([]);
   const [selectedDistricts, setSelectedDistricts] = useState([]);

   // Tải trạng thái tài xế và danh sách xe
   useEffect(() => {
      const fetchDriverStatus = async () => {
         setLoading(true);
         setError(null);

         try {
            // Tải danh sách xe của tài xế
            const vehiclesResponse = await vehicleService.getMyVehicles();
            if (vehiclesResponse.data?.success) {
               setVehicles(vehiclesResponse.data.data || []);
            }

            // Tải danh sách quận/huyện
            const districtsResponse = await driverService.getDistricts();
            if (districtsResponse.data?.success) {
               setDistricts(districtsResponse.data.data || []);
            }

            // Tải thông tin tài xế
            const driverResponse = await driverService.getDriverInfo();
            if (driverResponse.data?.success) {
               const driverData = driverResponse.data.data;
               setIsOnline(driverData.isOnline || false);
               setSelectedDistricts(driverData.serviceAreas || []);
               setStats({
                  totalTrips: driverData.totalTrips || 0,
                  rating: driverData.rating || 5.0,
                  earnings: driverData.incomeBalance || 0
               });
            }

            setLoading(false);
         } catch (error) {
            console.error("Lỗi khi tải thông tin tài xế:", error);
            setError("Không thể tải thông tin tài xế. Vui lòng thử lại sau.");
            setLoading(false);
         }
      };

      fetchDriverStatus();
   }, []);

   // Cập nhật trạng thái online/offline
   const handleToggleStatus = async (checked) => {
      setUpdating(true);

      try {
         const response = await orderService.setDriverOnline(checked);

         if (response.data?.success) {
            setIsOnline(checked);
            message.success(checked ? 'Đã bật trạng thái hoạt động' : 'Đã tắt trạng thái hoạt động');
         } else {
            setError("Không thể cập nhật trạng thái. Vui lòng thử lại.");
         }
      } catch (error) {
         console.error("Lỗi khi cập nhật trạng thái:", error);
         setError("Lỗi khi cập nhật trạng thái: " + (error.response?.data?.message || error.message));
      } finally {
         setUpdating(false);
      }
   };

   // Cập nhật khu vực hoạt động
   const handleUpdateServiceAreas = async () => {
      setUpdating(true);

      try {
         const response = await driverService.updateServiceAreas(selectedDistricts);

         if (response.data?.success) {
            message.success('Cập nhật khu vực hoạt động thành công');
         } else {
            setError("Không thể cập nhật khu vực hoạt động. Vui lòng thử lại.");
         }
      } catch (error) {
         console.error("Lỗi khi cập nhật khu vực hoạt động:", error);
         setError("Lỗi khi cập nhật khu vực hoạt động: " + (error.response?.data?.message || error.message));
      } finally {
         setUpdating(false);
      }
   };

   // Kiểm tra xem có xe nào đang hoạt động không
   const hasActiveVehicle = vehicles.some(v => v.status === 'Active');

   return (
      <div>
         <h2 className="text-2xl font-bold mb-4">Trạng thái tài xế</h2>

         {loading ? (
            <div className="flex justify-center py-10">
               <Spin size="large" tip="Đang tải thông tin..." />
            </div>
         ) : (
            <>
               {error && (
                  <Alert
                     message="Lỗi"
                     description={error}
                     type="error"
                     showIcon
                     className="mb-4"
                     closable
                     onClose={() => setError(null)}
                  />
               )}

               <Row gutter={[16, 16]}>
                  <Col xs={24} md={16}>
                     <Card title="Trạng thái hoạt động" className="mb-4">
                        <div className="flex items-center justify-between mb-4">
                           <div>
                              <h3 className="text-lg font-medium mb-2">
                                 {isOnline ? (
                                    <span className="text-green-600 flex items-center">
                                       <CheckCircleOutlined className="mr-2" /> Đang hoạt động
                                    </span>
                                 ) : (
                                    <span className="text-gray-500 flex items-center">
                                       <CloseCircleOutlined className="mr-2" /> Không hoạt động
                                    </span>
                                 )}
                              </h3>
                              <p className="text-gray-600">
                                 {isOnline
                                    ? "Bạn đang online và có thể nhận đơn hàng mới."
                                    : "Bạn đang offline và không thể nhận đơn hàng mới."}
                              </p>
                           </div>

                           <Switch
                              checked={isOnline}
                              onChange={handleToggleStatus}
                              loading={updating}
                              disabled={!hasActiveVehicle}
                              checkedChildren="Online"
                              unCheckedChildren="Offline"
                              className={isOnline ? "bg-green-500" : ""}
                           />
                        </div>

                        {!hasActiveVehicle && (
                           <Alert
                              message="Không có xe hoạt động"
                              description={
                                 <div>
                                    <p>Bạn cần có ít nhất một xe đang hoạt động để nhận đơn hàng.</p>
                                    <Button
                                       type="primary"
                                       className="mt-2 bg-blue-600"
                                       onClick={() => navigate('/driver/vehicles')}
                                    >
                                       Quản lý xe
                                    </Button>
                                 </div>
                              }
                              type="warning"
                              showIcon
                           />
                        )}
                     </Card>

                     <Card title="Khu vực hoạt động" className="mb-4">
                        <div className="mb-4">
                           <p className="text-gray-600 mb-2">Chọn các quận/huyện bạn muốn hoạt động:</p>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {districts.map(district => (
                                 <Checkbox
                                    key={district}
                                    checked={selectedDistricts.includes(district)}
                                    onChange={(e) => {
                                       if (e.target.checked) {
                                          setSelectedDistricts([...selectedDistricts, district]);
                                       } else {
                                          setSelectedDistricts(selectedDistricts.filter(d => d !== district));
                                       }
                                    }}
                                 >
                                    {district}
                                 </Checkbox>
                              ))}
                           </div>
                        </div>

                        <Button
                           type="primary"
                           onClick={handleUpdateServiceAreas}
                           loading={updating}
                           disabled={selectedDistricts.length === 0}
                           className="bg-blue-600"
                        >
                           Cập nhật khu vực hoạt động
                        </Button>
                     </Card>
                  </Col>

                  <Col xs={24} md={8}>
                     <Card title="Thống kê" className="mb-4">
                        <Row gutter={[16, 16]}>
                           <Col span={12}>
                              <Statistic
                                 title="Chuyến đã hoàn thành"
                                 value={stats.totalTrips}
                                 prefix={<CarOutlined />}
                              />
                           </Col>
                           <Col span={12}>
                              <Statistic
                                 title="Đánh giá"
                                 value={stats.rating}
                                 precision={1}
                                 prefix={<StarOutlined />}
                                 suffix="/5"
                              />
                           </Col>
                        </Row>
                        <Divider />
                        <Statistic
                           title="Tổng thu nhập"
                           value={stats.earnings}
                           precision={0}
                           prefix={<DollarCircleOutlined />}
                           formatter={(value) => formatCurrency(value)}
                        />
                     </Card>

                     <Card title="Danh sách xe" className="mb-4">
                        {vehicles.length > 0 ? (
                           <div className="space-y-4">
                              {vehicles.map((vehicle) => (
                                 <div key={vehicle._id} className="border-b pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                       <div>
                                          <h4 className="font-medium">{vehicle.type}</h4>
                                          <p className="text-gray-600">{vehicle.licensePlate}</p>
                                          <p className="text-sm text-gray-500">
                                             Trọng tải: {vehicle.maxWeightKg?.toLocaleString() || "N/A"} kg
                                          </p>
                                       </div>
                                       <div>
                                          <span className={`px-2 py-1 rounded text-xs ${vehicle.status === 'Active' ? 'bg-green-100 text-green-800' :
                                             vehicle.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                             }`}>
                                             {vehicle.status === 'Active' ? 'Đang hoạt động' :
                                                vehicle.status === 'Maintenance' ? 'Đang bảo trì' :
                                                   'Không hoạt động'}
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="text-center py-4">
                              <CarOutlined className="text-gray-400 text-3xl mb-2" />
                              <p className="text-gray-500">Bạn chưa có xe nào</p>
                              <Button
                                 type="primary"
                                 className="mt-2 bg-blue-600"
                                 onClick={() => navigate('/driver/vehicles')}
                              >
                                 Thêm xe mới
                              </Button>
                           </div>
                        )}
                     </Card>
                  </Col>
               </Row>
            </>
         )}
      </div>
   );
}