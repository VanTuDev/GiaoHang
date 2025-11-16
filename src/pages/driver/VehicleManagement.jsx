import React, { useState, useEffect } from 'react';
import {
   Card,
   Button,
   Empty,
   Spin,
   Alert,
   Modal,
   Form,
   Input,
   Select,
   Upload,
   message,
   Switch,
   Checkbox,
   Row,
   Col,
   Statistic,
   Badge,
   Space,
   Tag,
   Divider
} from 'antd';
import {
   PlusOutlined,
   CarOutlined,
   EditOutlined,
   DeleteOutlined,
   ExclamationCircleOutlined,
   CheckCircleOutlined,
   CloseCircleOutlined,
   ThunderboltOutlined,
   EnvironmentOutlined,
   DollarOutlined,
   StarOutlined,
   TrophyOutlined,
   RocketOutlined,
   AimOutlined,
   ReloadOutlined
} from '@ant-design/icons';
import { vehicleService } from '../../features/vehicles/api/vehicleService';
import { driverService } from '../../features/driver/api/driverService';
import { orderService } from '../../features/orders/api/orderService';
import { uploadToCloudinary } from '../../utils/cloudinaryService';
import { formatCurrency } from '../../utils/formatters';

export default function VehicleManagement() {
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [vehicles, setVehicles] = useState([]);
   const [modalVisible, setModalVisible] = useState(false);
   const [editingVehicle, setEditingVehicle] = useState(null);
   const [submitting, setSubmitting] = useState(false);
   const [fileList, setFileList] = useState([]);
   const [modal, contextHolder] = Modal.useModal();
   const [districts, setDistricts] = useState([]);
   const [selectedDistricts, setSelectedDistricts] = useState([]);
   const [isOnline, setIsOnline] = useState(false);
   const [updatingStatus, setUpdatingStatus] = useState(false);
   const [driverInfo, setDriverInfo] = useState(null);
   const [currentLocation, setCurrentLocation] = useState(null);
   const [locationUpdatedAt, setLocationUpdatedAt] = useState(null);
   const [updatingLocation, setUpdatingLocation] = useState(false);
   const [stats, setStats] = useState({
      totalTrips: 0,
      rating: 5.0,
      balance: 0,
      activeOrders: 0
   });

   // Tải dữ liệu ban đầu
   useEffect(() => {
      const fetchInitialData = async () => {
         setLoading(true);
         setError(null);

         try {
            // Tải danh sách xe
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
               setDriverInfo(driverData);
               setIsOnline(driverData.isOnline || false);
               setSelectedDistricts(driverData.serviceAreas || []);
               
               // Lưu thông tin vị trí
               if (driverData.currentLocation && driverData.currentLocation.coordinates) {
                  const [lng, lat] = driverData.currentLocation.coordinates;
                  setCurrentLocation({ latitude: lat, longitude: lng });
               }
               if (driverData.locationUpdatedAt) {
                  setLocationUpdatedAt(new Date(driverData.locationUpdatedAt));
               }
               
               setStats({
                  totalTrips: driverData.totalTrips || 0,
                  rating: driverData.rating || 5.0,
                  balance: driverData.balance || 0,
                  activeOrders: 0 // TODO: fetch from orders API
               });
            }
         } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
         } finally {
            setLoading(false);
         }
      };

      fetchInitialData();
   }, []);

   // Xử lý mở modal thêm xe mới
   const handleAddVehicle = () => {
      setEditingVehicle(null);
      form.resetFields();
      setFileList([]);
      setModalVisible(true);
   };

   // Xử lý mở modal chỉnh sửa xe
   const handleEditVehicle = (vehicle) => {
      setEditingVehicle(vehicle);
      form.setFieldsValue({
         type: vehicle.type,
         licensePlate: vehicle.licensePlate,
         maxWeightKg: vehicle.maxWeightKg,
         pricePerKm: vehicle.pricePerKm,
         description: vehicle.description,
         status: vehicle.status || 'Active'
      });

      if (vehicle.photoUrl) {
         setFileList([{
            uid: '-1',
            name: 'vehicle-photo.jpg',
            status: 'done',
            url: vehicle.photoUrl,
         }]);
      } else {
         setFileList([]);
      }

      setModalVisible(true);
   };

   // Xử lý xóa xe
   const handleDeleteVehicle = async (vehicleId) => {
      try {
         const response = await vehicleService.deleteVehicle(vehicleId);

         if (response.data?.success) {
            message.success('Xóa xe thành công');
            setVehicles(vehicles.filter(v => v._id !== vehicleId));
         } else {
            message.error('Không thể xóa xe');
         }
      } catch (error) {
         console.error("Lỗi khi xóa xe:", error);
         message.error("Lỗi khi xóa xe: " + (error.response?.data?.message || error.message));
      }
   };

   // Xác nhận xóa xe
   const confirmDeleteVehicle = (vehicle) => {
      modal.confirm({
         title: 'Xác nhận xóa xe',
         icon: <ExclamationCircleOutlined />,
         content: `Bạn có chắc chắn muốn xóa xe ${vehicle.type} (${vehicle.licensePlate}) không?`,
         okText: 'Xóa',
         okType: 'danger',
         cancelText: 'Hủy',
         onOk: () => handleDeleteVehicle(vehicle._id)
      });
   };

   // Xử lý lưu thông tin xe
   const handleSaveVehicle = async () => {
      try {
         const values = await form.validateFields();
         setSubmitting(true);

         // Upload ảnh lên Cloudinary nếu có
         let photoUrl = null;
         if (fileList.length > 0 && fileList[0].originFileObj) {
            try {
               const result = await uploadToCloudinary(fileList[0].originFileObj, 'vehicles');
               photoUrl = result.url;
            } catch (error) {
               console.error('Lỗi khi upload ảnh:', error);
               message.error('Không thể upload ảnh. Vui lòng thử lại sau.');
               setSubmitting(false);
               return;
            }
         } else if (fileList.length > 0 && fileList[0].url) {
            photoUrl = fileList[0].url;
         }

         // Chuẩn bị dữ liệu
        const vehicleData = {
            ...values,
            photoUrl
         };

         let response;

         if (editingVehicle) {
            response = await vehicleService.updateVehicle(editingVehicle._id, vehicleData);
         } else {
            response = await vehicleService.addVehicle(vehicleData);
         }

         if (response.data?.success) {
            message.success(editingVehicle ? 'Cập nhật xe thành công' : 'Thêm xe mới thành công');

            if (editingVehicle) {
               setVehicles(vehicles.map(v =>
                  v._id === editingVehicle._id ? { ...v, ...vehicleData, photoUrl } : v
               ));
            } else {
               setVehicles([...vehicles, { ...response.data.data, photoUrl }]);
            }

            setModalVisible(false);
         } else {
            message.error(editingVehicle ? 'Không thể cập nhật xe' : 'Không thể thêm xe mới');
         }
      } catch (error) {
         console.error("Lỗi khi lưu thông tin xe:", error);
         message.error("Lỗi khi lưu thông tin xe: " + (error.response?.data?.message || error.message));
      } finally {
         setSubmitting(false);
      }
   };

   // Xử lý bật/tắt trạng thái hoạt động
   const handleToggleOnline = async (checked) => {
      setUpdatingStatus(true);

      try {
         // Nếu bật online, lấy vị trí hiện tại và gửi lên server
         if (checked) {
            if (navigator.geolocation) {
               navigator.geolocation.getCurrentPosition(
                  async (position) => {
                     const { latitude, longitude } = position.coords;
                     
                     try {
                        // Cập nhật vị trí trước
                        await driverService.updateLocation(latitude, longitude);
                        console.log('📍 Đã cập nhật vị trí:', { latitude, longitude });
                        
                        // Sau đó mới bật online
                        const response = await orderService.setDriverOnline(checked);
                        
                        if (response.data?.success) {
                           setIsOnline(checked);
                           // Cập nhật vị trí trong state
                           setCurrentLocation({ latitude, longitude });
                           setLocationUpdatedAt(new Date());
                           message.success('Đã bật trạng thái hoạt động và cập nhật vị trí');
                           
                           // Tự động cập nhật vị trí định kỳ khi online (mỗi 30 giây)
                           if (window.locationUpdateInterval) {
                              clearInterval(window.locationUpdateInterval);
                           }
                           window.locationUpdateInterval = setInterval(async () => {
                              if (navigator.geolocation) {
                                 navigator.geolocation.getCurrentPosition(
                                    async (pos) => {
                                       try {
                                          await driverService.updateLocation(pos.coords.latitude, pos.coords.longitude);
                                          // Cập nhật state
                                          setCurrentLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                                          setLocationUpdatedAt(new Date());
                                          console.log('📍 Đã cập nhật vị trí định kỳ');
                                       } catch (err) {
                                          console.error('Lỗi cập nhật vị trí định kỳ:', err);
                                       }
                                    },
                                    (err) => {
                                       console.error('Lỗi lấy vị trí định kỳ:', err);
                                    }
                                 );
                              }
                           }, 30000); // 30 giây
                        } else {
                           message.error('Không thể cập nhật trạng thái hoạt động');
                        }
                     } catch (error) {
                        console.error("Lỗi khi cập nhật vị trí hoặc trạng thái:", error);
                        message.error("Lỗi khi cập nhật: " + (error.response?.data?.message || error.message));
                     } finally {
                        setUpdatingStatus(false);
                     }
                  },
                  (error) => {
                     console.error("Lỗi lấy vị trí:", error);
                     // Vẫn cho phép bật online nếu không lấy được vị trí
                     message.warning('Không thể lấy vị trí, vui lòng bật quyền truy cập vị trí để nhận đơn tốt hơn');
                     
                     // Bật online mà không có vị trí
                     orderService.setDriverOnline(checked).then(response => {
                        if (response.data?.success) {
                           setIsOnline(checked);
                           message.success('Đã bật trạng thái hoạt động (không có vị trí)');
                        }
                     }).catch(err => {
                        message.error("Lỗi khi cập nhật trạng thái: " + (err.response?.data?.message || err.message));
                     }).finally(() => {
                        setUpdatingStatus(false);
                     });
                  },
                  {
                     enableHighAccuracy: true,
                     timeout: 10000,
                     maximumAge: 0
                  }
               );
            } else {
               // Browser không hỗ trợ Geolocation
               message.warning('Trình duyệt không hỗ trợ lấy vị trí');
               const response = await orderService.setDriverOnline(checked);
               if (response.data?.success) {
                  setIsOnline(checked);
                  message.success('Đã bật trạng thái hoạt động');
               }
               setUpdatingStatus(false);
            }
         } else {
            // Tắt online
            if (window.locationUpdateInterval) {
               clearInterval(window.locationUpdateInterval);
               window.locationUpdateInterval = null;
            }
            
            const response = await orderService.setDriverOnline(checked);
            
            if (response.data?.success) {
               setIsOnline(checked);
               message.success('Đã tắt trạng thái hoạt động');
            } else {
               message.error('Không thể cập nhật trạng thái hoạt động');
            }
            setUpdatingStatus(false);
         }
      } catch (error) {
         console.error("Lỗi khi cập nhật trạng thái hoạt động:", error);
         message.error("Lỗi khi cập nhật trạng thái hoạt động: " + (error.response?.data?.message || error.message));
         setUpdatingStatus(false);
      }
   };

   // Xử lý cập nhật khu vực hoạt động
   const handleUpdateServiceAreas = async () => {
      setUpdatingStatus(true);

      try {
         const response = await driverService.updateServiceAreas(selectedDistricts);

         if (response.data?.success) {
            message.success('Cập nhật khu vực hoạt động thành công');
         } else {
            message.error('Không thể cập nhật khu vực hoạt động');
         }
      } catch (error) {
         console.error("Lỗi khi cập nhật khu vực hoạt động:", error);
         message.error("Lỗi khi cập nhật khu vực hoạt động: " + (error.response?.data?.message || error.message));
      } finally {
         setUpdatingStatus(false);
      }
   };

   // Xử lý cập nhật vị trí hiện tại
   const handleUpdateLocation = async () => {
      if (!navigator.geolocation) {
         message.error('Trình duyệt không hỗ trợ lấy vị trí');
         return;
      }

      setUpdatingLocation(true);

      navigator.geolocation.getCurrentPosition(
         async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
               const response = await driverService.updateLocation(latitude, longitude);
               
               if (response.data?.success) {
                  setCurrentLocation({ latitude, longitude });
                  setLocationUpdatedAt(new Date());
                  message.success('Cập nhật vị trí thành công');
                  
                  // Cập nhật driverInfo
                  if (driverInfo) {
                     setDriverInfo({
                        ...driverInfo,
                        currentLocation: {
                           type: 'Point',
                           coordinates: [longitude, latitude]
                        },
                        locationUpdatedAt: new Date()
                     });
                  }
               } else {
                  message.error('Không thể cập nhật vị trí');
               }
            } catch (error) {
               console.error("Lỗi khi cập nhật vị trí:", error);
               message.error("Lỗi khi cập nhật vị trí: " + (error.response?.data?.message || error.message));
            } finally {
               setUpdatingLocation(false);
            }
         },
         (error) => {
            console.error("Lỗi lấy vị trí:", error);
            let errorMessage = 'Không thể lấy vị trí';
            switch (error.code) {
               case error.PERMISSION_DENIED:
                  errorMessage = 'Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật quyền trong cài đặt trình duyệt.';
                  break;
               case error.POSITION_UNAVAILABLE:
                  errorMessage = 'Thông tin vị trí không khả dụng';
                  break;
               case error.TIMEOUT:
                  errorMessage = 'Hết thời gian chờ lấy vị trí';
                  break;
            }
            message.error(errorMessage);
            setUpdatingLocation(false);
         },
         {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
         }
      );
   };

   // Kiểm tra xem có xe nào đang hoạt động không
   const hasActiveVehicle = vehicles.some(v => v.status === 'Active');

   if (loading) {
      return (
         <div className="flex justify-center items-center h-screen">
            <Spin size="large" tip="Đang tải dữ liệu..." />
         </div>
      );
   }

   return (
      <div className="p-6 bg-gray-50 min-h-screen">
         {/* Header */}
         <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý xe & Trạng thái</h1>
            <p className="text-gray-600">Quản lý xe của bạn và trạng thái hoạt động để nhận đơn hàng</p>
         </div>

         {error && (
            <Alert
               message="Lỗi"
               description={error}
               type="error"
               showIcon
               className="mb-6"
               closable
               onClose={() => setError(null)}
            />
         )}

         {/* Stats Cards */}
         <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
               <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                  <Statistic
                     title={<span className="text-gray-600">Tổng chuyến</span>}
                     value={stats.totalTrips}
                     prefix={<CarOutlined className="text-blue-500" />}
                     valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                  />
               </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
               <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                  <Statistic
                     title={<span className="text-gray-600">Đánh giá</span>}
                     value={stats.rating}
                     precision={1}
                     suffix="/ 5"
                     prefix={<StarOutlined className="text-yellow-500" />}
                     valueStyle={{ color: '#faad14', fontSize: '24px' }}
                  />
               </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
               <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                  <Statistic
                     title={<span className="text-gray-600">Số dư</span>}
                     value={stats.balance}
                     prefix={<DollarOutlined className="text-green-500" />}
                     valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                     formatter={(value) => formatCurrency(value)}
                  />
               </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
               <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                  <Statistic
                     title={<span className="text-gray-600">Trạng thái</span>}
                     value={isOnline ? 'ONLINE' : 'OFFLINE'}
                     prefix={isOnline ? <ThunderboltOutlined className="text-purple-500" /> : <CloseCircleOutlined className="text-gray-400" />}
                     valueStyle={{ color: isOnline ? '#722ed1' : '#8c8c8c', fontSize: '20px' }}
                  />
               </Card>
            </Col>
         </Row>

         <Row gutter={[16, 16]}>
            {/* Left Column - Vehicle Management */}
            <Col xs={24} lg={14}>
               <Card
                  title={
                     <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold flex items-center">
                           <CarOutlined className="mr-2 text-blue-500" />
                           Danh sách xe
                        </span>
                        <Badge count={vehicles.length} showZero color="#1890ff" />
                     </div>
                  }
                  extra={
                     <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddVehicle}
                        className="bg-gradient-to-r from-blue-500 to-blue-600"
                     >
                        Thêm xe mới
                     </Button>
                  }
                  className="shadow-sm"
               >
                  {vehicles.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vehicles.map(vehicle => (
                           <Card
                              key={vehicle._id}
                              className="border hover:shadow-lg transition-all duration-300"
                              cover={
                                 vehicle.photoUrl ? (
                                    <div className="relative">
                                       <img
                                          alt={vehicle.type}
                                          src={vehicle.photoUrl}
                                          className="h-40 object-cover"
                                       />
                                       <div className="absolute top-2 right-2">
                                          <Tag color={vehicle.status === 'Active' ? 'success' : vehicle.status === 'Maintenance' ? 'warning' : 'default'}>
                                             {vehicle.status === 'Active' ? 'Hoạt động' : vehicle.status === 'Maintenance' ? 'Bảo trì' : 'Ngừng'}
                                          </Tag>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                       <CarOutlined className="text-5xl text-gray-400" />
                                    </div>
                                 )
                              }
                           >
                              <div className="space-y-2">
                                 <h3 className="font-semibold text-lg text-gray-800">{vehicle.type}</h3>
                                 <div className="space-y-1">
                                    <p className="text-gray-600">
                                       <span className="font-medium">Biển số:</span> <span className="text-blue-600">{vehicle.licensePlate}</span>
                                    </p>
                                    <p className="text-gray-600">
                                       <span className="font-medium">Trọng tải:</span> {vehicle.maxWeightKg?.toLocaleString() || "N/A"} kg
                                    </p>
                                    <p className="text-gray-600">
                                       <span className="font-medium">Giá/km:</span> {vehicle.pricePerKm ? formatCurrency(vehicle.pricePerKm) : '—'} / km
                                    </p>
                                    {vehicle.description && (
                                       <p className="text-gray-500 text-sm italic">{vehicle.description}</p>
                                    )}
                                 </div>
                                 <div className="flex justify-end space-x-2 pt-2 border-t">
                                    <Button
                                       size="small"
                                       icon={<EditOutlined />}
                                       onClick={() => handleEditVehicle(vehicle)}
                                    >
                                       Sửa
                                    </Button>
                                    <Button
                                       size="small"
                                       danger
                                       icon={<DeleteOutlined />}
                                       onClick={() => confirmDeleteVehicle(vehicle)}
                                    >
                                       Xóa
                                    </Button>
                                 </div>
                              </div>
                           </Card>
                        ))}
                     </div>
                  ) : (
                     <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                           <span className="text-gray-500">
                              Bạn chưa có xe nào. Hãy thêm xe để bắt đầu nhận đơn!
                           </span>
                        }
                        className="py-10"
                     >
                        <Button
                           type="primary"
                           icon={<PlusOutlined />}
                           onClick={handleAddVehicle}
                           size="large"
                           className="bg-gradient-to-r from-blue-500 to-blue-600"
                        >
                           Thêm xe đầu tiên
                        </Button>
                     </Empty>
                  )}
               </Card>
            </Col>

            {/* Right Column - Status & Service Areas */}
            <Col xs={24} lg={10}>
               {/* Online Status */}
               <Card
                  className="mb-4 shadow-sm"
                  title={
                     <span className="text-lg font-semibold flex items-center">
                        <RocketOutlined className="mr-2 text-purple-500" />
                        Trạng thái hoạt động
                     </span>
                  }
               >
                  <div className="text-center py-6">
                     <div className="mb-6">
                        {isOnline ? (
                           <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-4">
                              <CheckCircleOutlined className="text-5xl text-green-600" />
                           </div>
                        ) : (
                           <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4">
                              <CloseCircleOutlined className="text-5xl text-gray-400" />
                           </div>
                        )}
                        <h3 className={`text-2xl font-bold mb-2 ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                           {isOnline ? 'ĐANG HOẠT ĐỘNG' : 'KHÔNG HOẠT ĐỘNG'}
                        </h3>
                        <p className="text-gray-600">
                           {isOnline
                              ? 'Bạn đang online và sẵn sàng nhận đơn hàng mới'
                              : 'Bật để bắt đầu nhận đơn hàng'}
                        </p>
                     </div>

                     <Switch
                        checked={isOnline}
                        onChange={handleToggleOnline}
                        loading={updatingStatus}
                        disabled={!hasActiveVehicle}
                        checkedChildren={<span className="font-medium">ONLINE</span>}
                        unCheckedChildren={<span className="font-medium">OFFLINE</span>}
                        className={`${isOnline ? 'bg-green-500' : ''} transform scale-150`}
                     />

                     {!hasActiveVehicle && (
                        <Alert
                           message="Cần có xe hoạt động"
                           description="Bạn cần ít nhất một xe đang hoạt động để nhận đơn"
                           type="warning"
                           showIcon
                           className="mt-4"
                        />
                     )}
                  </div>
               </Card>

               {/* Current Location */}
               <Card
                  className="mb-4 shadow-sm"
                  title={
                     <span className="text-lg font-semibold flex items-center">
                        <AimOutlined className="mr-2 text-blue-500" />
                        Vị trí hiện tại
                     </span>
                  }
               >
                  <div className="space-y-4">
                     {currentLocation ? (
                        <>
                           <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                 <span className="text-sm font-medium text-gray-600">Tọa độ:</span>
                                 <Tag color="blue">
                                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                                 </Tag>
                              </div>
                              {locationUpdatedAt && (
                                 <div className="text-xs text-gray-500 mt-2">
                                    Cập nhật lần cuối: {new Date(locationUpdatedAt).toLocaleString('vi-VN')}
                                 </div>
                              )}
                           </div>
                           <Button
                              type="primary"
                              icon={<ReloadOutlined />}
                              onClick={handleUpdateLocation}
                              loading={updatingLocation}
                              block
                              className="bg-blue-600"
                           >
                              Cập nhật vị trí
                           </Button>
                        </>
                     ) : (
                        <>
                           <Alert
                              message="Chưa có vị trí"
                              description="Vị trí của bạn sẽ được tự động cập nhật khi bật online. Bạn cũng có thể cập nhật thủ công."
                              type="info"
                              showIcon
                              className="mb-4"
                           />
                           <Button
                              type="primary"
                              icon={<AimOutlined />}
                              onClick={handleUpdateLocation}
                              loading={updatingLocation}
                              block
                              className="bg-blue-600"
                           >
                              Lấy vị trí hiện tại
                           </Button>
                        </>
                     )}
                     
                     <div className="text-xs text-gray-500 text-center pt-2 border-t">
                        💡 Vị trí của bạn giúp hệ thống tìm đơn hàng gần nhất
                     </div>
                  </div>
               </Card>

               {/* Service Areas */}
               <Card
                  title={
                     <span className="text-lg font-semibold flex items-center">
                        <EnvironmentOutlined className="mr-2 text-red-500" />
                        Khu vực hoạt động
                     </span>
                  }
                  className="shadow-sm"
               >
                  <div className="space-y-4">
                     <p className="text-gray-600">Chọn các quận/huyện bạn muốn phục vụ:</p>
                     <div className="bg-gray-50 p-4 rounded-lg max-h-80 overflow-y-auto">
                        <div className="grid grid-cols-1 gap-2">
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
                                 className="hover:bg-white p-2 rounded transition-colors"
                              >
                                 <span className="font-medium">{district}</span>
                              </Checkbox>
                           ))}
                        </div>
                     </div>

                     <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm text-gray-600">
                           Đã chọn: <strong className="text-blue-600">{selectedDistricts.length}</strong> khu vực
                        </span>
                        <Button
                           type="primary"
                           onClick={handleUpdateServiceAreas}
                           loading={updatingStatus}
                           disabled={selectedDistricts.length === 0}
                           icon={<CheckCircleOutlined />}
                           className="bg-gradient-to-r from-blue-500 to-blue-600"
                        >
                           Cập nhật
                        </Button>
                     </div>
                  </div>
               </Card>
            </Col>
         </Row>

         {/* Modal thêm/sửa xe */}
         <Modal
            title={
               <span className="text-xl font-semibold">
                  {editingVehicle ? "Chỉnh sửa thông tin xe" : "Thêm xe mới"}
               </span>
            }
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
               <Button key="cancel" onClick={() => setModalVisible(false)} size="large">
                  Hủy
               </Button>,
               <Button
                  key="submit"
                  type="primary"
                  loading={submitting}
                  onClick={handleSaveVehicle}
                  size="large"
                  className="bg-gradient-to-r from-blue-500 to-blue-600"
               >
                  {editingVehicle ? "Cập nhật" : "Thêm mới"}
               </Button>
            ]}
            width={600}
         >
            <Form
               form={form}
               layout="vertical"
               className="mt-4"
            >
               <Form.Item
                  name="type"
                  label={<span className="font-medium">Loại xe</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}
               >
                  <Select placeholder="Chọn loại xe" size="large">
                     <Select.Option value="TruckSmall">🚛 Xe tải nhỏ (0.5-1 tấn)</Select.Option>
                     <Select.Option value="TruckMedium">🚚 Xe tải vừa (1-3 tấn)</Select.Option>
                     <Select.Option value="TruckLarge">🚛 Xe tải to (3-5 tấn)</Select.Option>
                     <Select.Option value="TruckBox">📦 Xe thùng (5-10 tấn)</Select.Option>
                     <Select.Option value="DumpTruck">🏗️ Xe ben</Select.Option>
                     <Select.Option value="PickupTruck">🛻 Xe bán tải</Select.Option>
                     <Select.Option value="Trailer">🚜 Xe kéo</Select.Option>
                  </Select>
               </Form.Item>

               <Form.Item
                  name="licensePlate"
                  label={<span className="font-medium">Biển số xe</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}
               >
                  <Input placeholder="VD: 43A-12345" size="large" />
               </Form.Item>

               <Form.Item
                  name="maxWeightKg"
                  label={<span className="font-medium">Trọng tải tối đa (kg)</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập trọng tải tối đa' }]}
               >
                  <Input type="number" placeholder="VD: 1000" size="large" />
               </Form.Item>

               <Form.Item
                  name="pricePerKm"
                  label={<span className="font-medium">Giá / km (VND)</span>}
                  tooltip="Giá bạn mong muốn cho mỗi km vận chuyển"
                  rules={[
                     { required: true, message: 'Vui lòng nhập giá mỗi km' },
                     {
                        validator: (_, value) => {
                           if (value === undefined || value === null || value === '') return Promise.reject('Vui lòng nhập giá');
                           const n = Number(value);
                           if (Number.isNaN(n) || n <= 0) return Promise.reject('Giá phải > 0');
                           return Promise.resolve();
                        }
                     }
                  ]}
               >
                  <Input type="number" placeholder="VD: 40000" size="large" />
               </Form.Item>

               <Form.Item
                  name="description"
                  label={<span className="font-medium">Mô tả</span>}
               >
                  <Input.TextArea rows={3} placeholder="Mô tả về xe (tùy chọn)" />
               </Form.Item>

               <Form.Item
                  name="status"
                  label={<span className="font-medium">Trạng thái</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                  initialValue="Active"
               >
                  <Select placeholder="Chọn trạng thái" size="large">
                     <Select.Option value="Active">✅ Đang hoạt động</Select.Option>
                     <Select.Option value="Maintenance">🔧 Đang bảo trì</Select.Option>
                     <Select.Option value="Inactive">⛔ Không hoạt động</Select.Option>
                  </Select>
               </Form.Item>

               <Form.Item
                  label={<span className="font-medium">Hình ảnh xe</span>}
               >
                  <Upload
                     listType="picture-card"
                     fileList={fileList}
                     onChange={({ fileList }) => setFileList(fileList)}
                     beforeUpload={() => false}
                     maxCount={1}
                  >
                     {fileList.length >= 1 ? null : (
                        <div>
                           <PlusOutlined />
                           <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                        </div>
                     )}
                  </Upload>
               </Form.Item>
            </Form>
         </Modal>

         {contextHolder}
      </div>
   );
}
