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
   Divider,
   Tabs
} from 'antd';
import {
   PlusOutlined,
   CarOutlined,
   EditOutlined,
   DeleteOutlined,
   ExclamationCircleOutlined,
   UploadOutlined,
   CheckCircleOutlined,
   CloseCircleOutlined
} from '@ant-design/icons';
import { vehicleService } from '../../features/vehicles/api/vehicleService';
import { driverService } from '../../features/driver/api/driverService';
import { orderService } from '../../features/orders/api/orderService';
import { uploadToCloudinary } from '../../utils/cloudinaryService';

const { TabPane } = Tabs;

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
   const [activeTab, setActiveTab] = useState('vehicles');
   const [driverInfo, setDriverInfo] = useState(null);

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
               // Sử dụng API upload mới
               const result = await uploadToCloudinary(fileList[0].originFileObj, 'vehicles');
               photoUrl = result.url; // API backend trả về result.url
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
            // Cập nhật xe
            response = await vehicleService.updateVehicle(editingVehicle._id, vehicleData);
         } else {
            // Thêm xe mới
            response = await vehicleService.addVehicle(vehicleData);
         }

         if (response.data?.success) {
            message.success(editingVehicle ? 'Cập nhật xe thành công' : 'Thêm xe mới thành công');

            // Cập nhật danh sách xe
            if (editingVehicle) {
               setVehicles(vehicles.map(v =>
                  v._id === editingVehicle._id ? { ...v, ...vehicleData, photoUrl } : v
               ));
            } else {
               setVehicles([...vehicles, { ...response.data.data, photoUrl }]);
            }

            // Đóng modal
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
         const response = await orderService.setDriverOnline(checked);

         if (response.data?.success) {
            setIsOnline(checked);
            message.success(checked ? 'Đã bật trạng thái hoạt động' : 'Đã tắt trạng thái hoạt động');
         } else {
            message.error('Không thể cập nhật trạng thái hoạt động');
         }
      } catch (error) {
         console.error("Lỗi khi cập nhật trạng thái hoạt động:", error);
         message.error("Lỗi khi cập nhật trạng thái hoạt động: " + (error.response?.data?.message || error.message));
      } finally {
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

   // Kiểm tra xem có xe nào đang hoạt động không
   const hasActiveVehicle = vehicles.some(v => v.status === 'Active');

   return (
      <div>
         <h2 className="text-2xl font-bold mb-4">Quản lý xe và trạng thái</h2>

         <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Quản lý xe" key="vehicles">
               <div className="flex justify-between items-center mb-4">
                  <div>
                     <span className="text-gray-500">Tổng số xe: {vehicles.length}</span>
                  </div>
                  <Button
                     type="primary"
                     icon={<PlusOutlined />}
                     onClick={handleAddVehicle}
                     className="bg-blue-600"
                  >
                     Thêm xe mới
                  </Button>
               </div>

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

               {loading ? (
                  <div className="flex justify-center py-10">
                     <Spin size="large" tip="Đang tải danh sách xe..." />
                  </div>
               ) : vehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {vehicles.map(vehicle => (
                        <Card
                           key={vehicle._id}
                           className="h-full"
                           cover={
                              vehicle.photoUrl ? (
                                 <img
                                    alt={vehicle.type}
                                    src={vehicle.photoUrl}
                                    className="h-48 object-cover"
                                 />
                              ) : (
                                 <div className="h-48 bg-gray-200 flex items-center justify-center">
                                    <CarOutlined className="text-4xl text-gray-400" />
                                 </div>
                              )
                           }
                           actions={[
                              <Button
                                 icon={<EditOutlined />}
                                 onClick={() => handleEditVehicle(vehicle)}
                              >
                                 Chỉnh sửa
                              </Button>,
                              <Button
                                 danger
                                 icon={<DeleteOutlined />}
                                 onClick={() => confirmDeleteVehicle(vehicle)}
                              >
                                 Xóa
                              </Button>
                           ]}
                        >
                           <Card.Meta
                              title={
                                 <div className="flex justify-between items-center">
                                    <span>{vehicle.type}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${vehicle.status === 'Active' ? 'bg-green-100 text-green-800' :
                                       vehicle.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-gray-100 text-gray-800'
                                       }`}>
                                       {vehicle.status === 'Active' ? 'Đang hoạt động' :
                                          vehicle.status === 'Maintenance' ? 'Đang bảo trì' :
                                             'Không hoạt động'}
                                    </span>
                                 </div>
                              }
                              description={
                                 <div>
                                    <p><strong>Biển số:</strong> {vehicle.licensePlate}</p>
                                    <p><strong>Trọng tải:</strong> {vehicle.maxWeightKg?.toLocaleString() || "N/A"} kg</p>
                                    {vehicle.description && <p><strong>Mô tả:</strong> {vehicle.description}</p>}
                                 </div>
                              }
                           />
                        </Card>
                     ))}
                  </div>
               ) : (
                  <Empty
                     image={Empty.PRESENTED_IMAGE_SIMPLE}
                     description="Bạn chưa có xe nào"
                     className="py-10"
                  >
                     <Button
                        type="primary"
                        onClick={handleAddVehicle}
                        className="bg-blue-600"
                     >
                        Thêm xe mới
                     </Button>
                  </Empty>
               )}
            </TabPane>

            <TabPane tab="Trạng thái hoạt động" key="status">
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
                        onChange={handleToggleOnline}
                        loading={updatingStatus}
                        disabled={!hasActiveVehicle}
                        checkedChildren="Online"
                        unCheckedChildren="Offline"
                        className={isOnline ? "bg-green-500" : ""}
                     />
                  </div>

                  {!hasActiveVehicle && (
                     <Alert
                        message="Không có xe hoạt động"
                        description="Bạn cần có ít nhất một xe đang hoạt động để nhận đơn hàng."
                        type="warning"
                        showIcon
                     />
                  )}
               </Card>

               <Card title="Khu vực hoạt động">
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
                     loading={updatingStatus}
                     disabled={selectedDistricts.length === 0}
                     className="bg-blue-600"
                  >
                     Cập nhật khu vực hoạt động
                  </Button>
               </Card>
            </TabPane>
         </Tabs>

         {/* Modal thêm/sửa xe */}
         <Modal
            title={editingVehicle ? "Chỉnh sửa thông tin xe" : "Thêm xe mới"}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
               <Button key="cancel" onClick={() => setModalVisible(false)}>
                  Hủy
               </Button>,
               <Button
                  key="submit"
                  type="primary"
                  loading={submitting}
                  onClick={handleSaveVehicle}
                  className="bg-blue-600"
               >
                  {editingVehicle ? "Cập nhật" : "Thêm mới"}
               </Button>
            ]}
         >
            <Form
               form={form}
               layout="vertical"
            >
               <Form.Item
                  name="type"
                  label="Loại xe"
                  rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}
               >
                  <Select placeholder="Chọn loại xe">
                     <Select.Option value="TruckSmall">Xe tải nhỏ (0.5-1 tấn)</Select.Option>
                     <Select.Option value="TruckMedium">Xe tải vừa (1-3 tấn)</Select.Option>
                     <Select.Option value="TruckLarge">Xe tải to (3-5 tấn)</Select.Option>
                     <Select.Option value="TruckBox">Xe thùng (5-10 tấn)</Select.Option>
                     <Select.Option value="DumpTruck">Xe ben</Select.Option>
                     <Select.Option value="PickupTruck">Xe bán tải</Select.Option>
                     <Select.Option value="Trailer">Xe kéo</Select.Option>
                  </Select>
               </Form.Item>

               <Form.Item
                  name="licensePlate"
                  label="Biển số xe"
                  rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}
               >
                  <Input placeholder="Biển số xe" />
               </Form.Item>

               <Form.Item
                  name="maxWeightKg"
                  label="Trọng tải tối đa (kg)"
                  rules={[{ required: true, message: 'Vui lòng nhập trọng tải tối đa' }]}
               >
                  <Input type="number" placeholder="Trọng tải tối đa (kg)" />
               </Form.Item>

               <Form.Item
                  name="description"
                  label="Mô tả"
               >
                  <Input.TextArea rows={3} placeholder="Mô tả về xe" />
               </Form.Item>

               <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                  initialValue="Active"
               >
                  <Select placeholder="Chọn trạng thái">
                     <Select.Option value="Active">Đang hoạt động</Select.Option>
                     <Select.Option value="Maintenance">Đang bảo trì</Select.Option>
                     <Select.Option value="Inactive">Không hoạt động</Select.Option>
                  </Select>
               </Form.Item>

               <Form.Item
                  label="Hình ảnh xe"
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
                           <div style={{ marginTop: 8 }}>Tải lên</div>
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
