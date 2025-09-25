"use client"

import React, { useState, useEffect } from "react"
import {
   SearchOutlined,
   CarOutlined,
   PhoneOutlined,
   EnvironmentOutlined,
   StarFilled,
   ClockCircleOutlined,
   LoadingOutlined,
   PlusOutlined,
   InfoCircleOutlined,
   CheckCircleOutlined,
} from "@ant-design/icons"
import { Input, Select, Form, Card, Button, Spin, Empty, message, Modal, Checkbox, InputNumber, Upload, Divider } from "antd"
import { useLocation, useNavigate } from "react-router-dom"

import VehicleDetailModal from "./modal/VehicleDetailModal"
import { vehicleService } from "../../features/vehicles/api/vehicleService"
import { orderService } from "../../features/orders/api/orderService"
import { formatCurrency } from "../../utils/formatters"

const { TextArea } = Input;

export default function OrderCreate() {
   const [form] = Form.useForm();
   const navigate = useNavigate();
   const location = useLocation();
   const queryParams = new URLSearchParams(location.search);

   // States
   const [loading, setLoading] = useState(false);
   const [vehicles, setVehicles] = useState([]);
   const [filteredVehicles, setFilteredVehicles] = useState([]);
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedDistrict, setSelectedDistrict] = useState("all");
   const [selectedType, setSelectedType] = useState(queryParams.get("type") || "all");
   const [selectedWeight, setSelectedWeight] = useState(queryParams.get("weight") || "all");
   const [selectedVehicle, setSelectedVehicle] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [vehicleDetailLoading, setVehicleDetailLoading] = useState(false);
   const [orderItems, setOrderItems] = useState([]);
   const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
   const [submitting, setSubmitting] = useState(false);
   const [imageList, setImageList] = useState([]);
   const [imageUploading, setImageUploading] = useState(false);

   // Danh sách quận/huyện
   const districts = [
      "Tất cả quận",
      "Quận Cẩm Lệ",
      "Quận Hải Châu",
      "Quận Liên Chiểu",
      "Quận Ngũ Hành Sơn",
      "Quận Sơn Trà",
      "Quận Thanh Khê",
      "Huyện Hòa Vang",
      "Huyện Hoàng Sa"
   ];

   // Tải danh sách xe
   useEffect(() => {
      const fetchVehicles = async () => {
         setLoading(true);
         try {
            const params = {};
            if (selectedType !== "all") params.type = selectedType;
            if (selectedWeight !== "all") params.weightKg = selectedWeight;
            if (selectedDistrict !== "all") params.district = selectedDistrict;
            params.onlineOnly = true;

            const response = await vehicleService.listVehicles(params);
            if (response.data?.success) {
               setVehicles(response.data.data);
               setFilteredVehicles(response.data.data);
            } else {
               message.error("Không thể tải danh sách xe");
            }
         } catch (error) {
            console.error("Lỗi khi tải danh sách xe:", error);
            message.error("Lỗi khi tải danh sách xe");
         } finally {
            setLoading(false);
         }
      };

      fetchVehicles();
   }, [selectedType, selectedWeight, selectedDistrict]);

   // Lọc xe theo từ khóa tìm kiếm
   useEffect(() => {
      if (!searchTerm.trim()) {
         setFilteredVehicles(vehicles);
         return;
      }

      const filtered = vehicles.filter((vehicle) => {
         const searchLower = searchTerm.toLowerCase();
         const matchesType = vehicle.type?.toLowerCase().includes(searchLower);
         const matchesDriver = vehicle.driverId?.userId?.name?.toLowerCase().includes(searchLower);
         const matchesLicense = vehicle.licensePlate?.toLowerCase().includes(searchLower);

         return matchesType || matchesDriver || matchesLicense;
      });

      setFilteredVehicles(filtered);
   }, [searchTerm, vehicles]);

   // Xử lý mở modal chi tiết xe
   const handleOpenModal = (vehicle) => {
      setSelectedVehicle(vehicle);
      setVehicleDetailLoading(true);
      setIsModalOpen(true);

      // Giả lập tải dữ liệu chi tiết (trong thực tế có thể gọi API)
      setTimeout(() => {
         setVehicleDetailLoading(false);
      }, 500);
   };

   // Xử lý đóng modal
   const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedVehicle(null);
   };

   // Xử lý chọn xe để đặt
   const handleSelectVehicle = (vehicle) => {
      // Kiểm tra xem xe đã được chọn chưa
      const exists = orderItems.some(item => item.vehicleId === vehicle._id);

      if (exists) {
         message.warning("Xe này đã được thêm vào đơn hàng");
         return;
      }

      // Thêm xe vào danh sách đặt
      setOrderItems([...orderItems, {
         vehicleId: vehicle._id,
         vehicleType: vehicle.type,
         vehicleInfo: vehicle,
         weightKg: vehicle.maxWeightKg / 2, // Mặc định là 1/2 trọng tải tối đa
         distanceKm: 10, // Mặc định là 10km
         loadingService: false,
         insurance: false
      }]);

      message.success("Đã thêm xe vào đơn hàng");
   };

   // Xử lý xóa xe khỏi đơn hàng
   const handleRemoveVehicle = (index) => {
      const newItems = [...orderItems];
      newItems.splice(index, 1);
      setOrderItems(newItems);
   };

   // Xử lý thay đổi thông tin đơn hàng
   const handleItemChange = (index, field, value) => {
      const newItems = [...orderItems];
      newItems[index][field] = value;
      setOrderItems(newItems);
   };

   // Tính giá đơn hàng
   const calculatePrice = (item) => {
      const { vehicleType, weightKg, distanceKm, loadingService, insurance } = item;

      // Lấy giá cơ bản theo loại xe
      let pricePerKm = 40000; // Mặc định
      if (item.vehicleInfo && item.vehicleInfo.pricePerKm) {
         pricePerKm = item.vehicleInfo.pricePerKm;
      } else {
         // Tính giá theo trọng lượng nếu không có thông tin từ xe
         const ton = weightKg / 1000;
         if (ton <= 1) pricePerKm = 40000;
         else if (ton <= 3) pricePerKm = 60000;
         else if (ton <= 5) pricePerKm = 80000;
         else if (ton <= 10) pricePerKm = 100000;
         else pricePerKm = 150000;
      }

      // Tính giá theo khoảng cách
      const distanceCost = pricePerKm * distanceKm;

      // Phí bốc xếp hàng hóa
      const loadingFee = loadingService ? 50000 : 0;

      // Phí bảo hiểm
      const insuranceFee = insurance ? 100000 : 0;

      // Tổng cộng
      const total = distanceCost + loadingFee + insuranceFee;

      return {
         basePerKm: pricePerKm,
         distanceCost,
         loadingFee,
         insuranceFee,
         total
      };
   };

   // Tính tổng giá đơn hàng
   const calculateTotalPrice = () => {
      return orderItems.reduce((total, item) => {
         const price = calculatePrice(item);
         return total + price.total;
      }, 0);
   };

   // Xử lý upload ảnh
   const handleImageChange = (info) => {
      if (info.file.status === 'uploading') {
         setImageUploading(true);
         return;
      }

      if (info.file.status === 'done') {
         setImageUploading(false);
         // Trong thực tế, bạn sẽ lưu URL từ response của server
         // Ở đây chúng ta giả lập việc upload thành công
         setImageList([...imageList, {
            uid: info.file.uid,
            name: info.file.name,
            status: 'done',
            url: URL.createObjectURL(info.file.originFileObj),
         }]);
      }
   };

   // Xử lý gửi đơn hàng
   const handleSubmitOrder = async (values) => {
      if (orderItems.length === 0) {
         message.error("Vui lòng chọn ít nhất một xe");
         return;
      }

      setSubmitting(true);

      try {
         const { pickupAddress, dropoffAddress, customerNote } = values;

         // Chuẩn bị dữ liệu đơn hàng
         const orderData = {
            pickupAddress,
            dropoffAddress,
            customerNote,
            paymentMethod: "Cash", // Mặc định là tiền mặt
            items: orderItems.map(item => ({
               vehicleType: item.vehicleType,
               weightKg: item.weightKg,
               distanceKm: item.distanceKm,
               loadingService: item.loadingService,
               insurance: item.insurance,
               itemPhotos: [] // Trong thực tế, bạn sẽ gửi URLs của ảnh đã upload
            }))
         };

         // Gửi đơn hàng
         const response = await orderService.createOrder(orderData);

         if (response.data?.success) {
            message.success("Đặt đơn hàng thành công");
            // Chuyển hướng đến trang danh sách đơn hàng
            navigate("/dashboard/orders");
         } else {
            message.error("Lỗi khi đặt đơn hàng: " + (response.data?.message || "Vui lòng thử lại"));
         }
      } catch (error) {
         console.error("Lỗi khi đặt đơn hàng:", error);
         message.error("Lỗi khi đặt đơn hàng: " + (error.response?.data?.message || error.message || "Vui lòng thử lại"));
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <div className="h-full overflow-auto">
         {/* Form đặt hàng */}
         {orderItems.length > 0 && (
            <div className="mb-6">
               <Card title="Thông tin đơn hàng" className="shadow-sm">
                  <Form
                     form={form}
                     layout="vertical"
                     onFinish={handleSubmitOrder}
                     initialValues={{
                        pickupAddress: "",
                        dropoffAddress: "",
                        customerNote: ""
                     }}
                  >
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                           name="pickupAddress"
                           label="Địa chỉ lấy hàng"
                           rules={[{ required: true, message: "Vui lòng nhập địa chỉ lấy hàng" }]}
                        >
                           <Input prefix={<EnvironmentOutlined />} placeholder="Nhập địa chỉ lấy hàng" />
                        </Form.Item>

                        <Form.Item
                           name="dropoffAddress"
                           label="Địa chỉ giao hàng"
                           rules={[{ required: true, message: "Vui lòng nhập địa chỉ giao hàng" }]}
                        >
                           <Input prefix={<EnvironmentOutlined />} placeholder="Nhập địa chỉ giao hàng" />
                        </Form.Item>
                     </div>

                     <Form.Item
                        name="customerNote"
                        label="Ghi chú"
                     >
                        <TextArea rows={3} placeholder="Nhập ghi chú cho đơn hàng (nếu có)" />
                     </Form.Item>

                     <Divider>Danh sách xe đã chọn</Divider>

                     {orderItems.map((item, index) => (
                        <Card
                           key={index}
                           className="mb-4 border border-blue-100"
                           extra={
                              <Button
                                 danger
                                 onClick={() => handleRemoveVehicle(index)}
                              >
                                 Xóa
                              </Button>
                           }
                        >
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                 <p className="font-medium">{item.vehicleInfo?.type || item.vehicleType}</p>
                                 <p className="text-gray-500">
                                    {item.vehicleInfo?.licensePlate || "Chưa có biển số"}
                                 </p>

                                 <div className="mt-3">
                                    <div className="mb-2">
                                       <label className="text-sm text-gray-600">Khối lượng hàng (kg):</label>
                                       <InputNumber
                                          min={1}
                                          max={item.vehicleInfo?.maxWeightKg || 10000}
                                          value={item.weightKg}
                                          onChange={(value) => handleItemChange(index, "weightKg", value)}
                                          className="ml-2"
                                       />
                                    </div>

                                    <div className="mb-2">
                                       <label className="text-sm text-gray-600">Khoảng cách (km):</label>
                                       <InputNumber
                                          min={1}
                                          value={item.distanceKm}
                                          onChange={(value) => handleItemChange(index, "distanceKm", value)}
                                          className="ml-2"
                                       />
                                    </div>
                                 </div>
                              </div>

                              <div>
                                 <div className="mb-2">
                                    <Checkbox
                                       checked={item.loadingService}
                                       onChange={(e) => handleItemChange(index, "loadingService", e.target.checked)}
                                    >
                                       Dịch vụ bốc xếp hàng (+50,000đ)
                                    </Checkbox>
                                 </div>

                                 <div className="mb-4">
                                    <Checkbox
                                       checked={item.insurance}
                                       onChange={(e) => handleItemChange(index, "insurance", e.target.checked)}
                                    >
                                       Bảo hiểm hàng hóa (+100,000đ)
                                    </Checkbox>
                                 </div>

                                 <div className="bg-gray-50 p-3 rounded">
                                    <p className="font-medium">Chi phí:</p>
                                    <p>Cước phí: {formatCurrency(calculatePrice(item).distanceCost)}</p>
                                    {item.loadingService && <p>Phí bốc xếp: {formatCurrency(calculatePrice(item).loadingFee)}</p>}
                                    {item.insurance && <p>Phí bảo hiểm: {formatCurrency(calculatePrice(item).insuranceFee)}</p>}
                                    <p className="font-bold text-blue-600">
                                       Tổng: {formatCurrency(calculatePrice(item).total)}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </Card>
                     ))}

                     <div className="flex justify-between items-center mt-4">
                        <div className="text-lg">
                           <span className="font-medium">Tổng cộng: </span>
                           <span className="font-bold text-blue-600">{formatCurrency(calculateTotalPrice())}</span>
                        </div>

                        <Button
                           type="primary"
                           htmlType="submit"
                           loading={submitting}
                           className="bg-blue-600"
                           size="large"
                        >
                           Đặt đơn hàng
                        </Button>
                     </div>
                  </Form>
               </Card>
            </div>
         )}

         {/* Filters sticky */}
         <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
            <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-1 md:grid-cols-5 gap-3">
               <div className="flex items-center border rounded px-2">
                  <SearchOutlined className="text-gray-400 mr-2" />
                  <input
                     type="text"
                     placeholder="Tìm xe, quận..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full outline-none py-1"
                  />
               </div>
               <Select
                  value={selectedDistrict}
                  onChange={setSelectedDistrict}
                  className="w-full"
                  options={districts.map((d) => ({ value: d === "Tất cả quận" ? "all" : d, label: d }))}
               />
               <Select
                  value={selectedType}
                  onChange={setSelectedType}
                  className="w-full"
                  options={[
                     { value: "all", label: "Tất cả xe" },
                     { value: "TruckSmall", label: "Xe tải nhỏ" },
                     { value: "TruckMedium", label: "Xe tải vừa" },
                     { value: "TruckLarge", label: "Xe tải lớn" },
                     { value: "TruckBox", label: "Xe thùng" },
                     { value: "DumpTruck", label: "Xe ben" },
                     { value: "PickupTruck", label: "Xe bán tải" },
                     { value: "Trailer", label: "Xe kéo" }
                  ]}
               />
               <Select
                  value={selectedWeight}
                  onChange={setSelectedWeight}
                  className="w-full"
                  options={[
                     { value: "all", label: "Tất cả trọng tải" },
                     { value: "500", label: "0 - 500kg" },
                     { value: "1000", label: "0 - 1 tấn" },
                     { value: "3000", label: "0 - 3 tấn" },
                     { value: "5000", label: "0 - 5 tấn" },
                     { value: "10000", label: "0 - 10 tấn" }
                  ]}
               />
               <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500">
                     {filteredVehicles.length} xe
                  </span>
                  {orderItems.length > 0 && (
                     <Button
                        type="primary"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-blue-600"
                     >
                        Xem giỏ hàng ({orderItems.length})
                     </Button>
                  )}
               </div>
            </div>
         </div>

         {/* Vehicle Grid */}
         {loading ? (
            <div className="flex justify-center items-center py-20">
               <Spin size="large" tip="Đang tải danh sách xe..." />
            </div>
         ) : filteredVehicles.length > 0 ? (
            <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {filteredVehicles.map((vehicle) => (
                  <Card
                     key={vehicle._id}
                     hoverable
                     cover={
                        <img
                           src={vehicle.photoUrl || "https://placehold.co/600x400?text=" + vehicle.type}
                           alt={vehicle.type}
                           className="h-44 w-full object-cover cursor-pointer"
                           onClick={() => handleOpenModal(vehicle)}
                        />
                     }
                     className="h-full flex flex-col"
                  >
                     <div className="flex-grow">
                        <h3 className="text-lg font-semibold">{vehicle.type}</h3>
                        {vehicle.driverId && (
                           <div className="flex items-center text-sm mb-2">
                              <StarFilled className="text-yellow-500 mr-1" />
                              {vehicle.driverId.rating || "N/A"}
                              <span className="mx-1">•</span>
                              <span>{vehicle.driverId.totalTrips || 0} chuyến</span>
                           </div>
                        )}
                        <p className="text-gray-600 text-sm mb-2">
                           {vehicle.description || `Xe ${vehicle.type} chở hàng`}
                        </p>
                        <div className="mb-3">
                           <span className="text-gray-500 text-sm">Trọng tải tối đa: </span>
                           <span className="font-medium">{vehicle.maxWeightKg?.toLocaleString() || "N/A"} kg</span>
                        </div>
                        <div className="mb-3">
                           <span className="text-gray-500 text-sm">Giá từ: </span>
                           <span className="font-bold text-blue-600">
                              {formatCurrency(vehicle.pricePerKm || 40000)}/km
                           </span>
                        </div>
                     </div>
                     <div className="mt-auto pt-3 border-t border-gray-100 flex gap-2">
                        <Button
                           className="flex-1"
                           onClick={() => handleOpenModal(vehicle)}
                        >
                           Chi tiết
                        </Button>
                        <Button
                           type="primary"
                           className="flex-1 bg-blue-600"
                           onClick={() => handleSelectVehicle(vehicle)}
                        >
                           Chọn xe
                        </Button>
                     </div>
                  </Card>
               ))}
            </div>
         ) : (
            <div className="text-center py-12">
               <CarOutlined className="text-gray-400 text-5xl mb-2" />
               <h3 className="text-lg font-semibold mb-1">Không tìm thấy xe phù hợp</h3>
               <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
         )}

         {/* Modal chi tiết xe */}
         <VehicleDetailModal
            open={isModalOpen}
            onClose={handleCloseModal}
            vehicle={selectedVehicle}
            loading={vehicleDetailLoading}
         />
      </div>
   )
}