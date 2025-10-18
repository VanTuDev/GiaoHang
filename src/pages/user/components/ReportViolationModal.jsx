import React, { useState } from "react";
import { Modal, Form, Select, Input, Upload, Button, message, Card, Alert } from "antd";
import {
   ExclamationCircleOutlined,
   UploadOutlined,
   DeleteOutlined,
   WarningOutlined
} from "@ant-design/icons";
import { violationService } from "../../../features/violations/api/violationService";

const { TextArea } = Input;
const { Option } = Select;

const VIOLATION_TYPES = [
   { value: "LatePickup", label: "Trễ lấy hàng", icon: "⏰" },
   { value: "LateDelivery", label: "Trễ giao hàng", icon: "🚚" },
   { value: "RudeBehavior", label: "Thái độ không tốt", icon: "😠" },
   { value: "DamagedGoods", label: "Làm hỏng hàng hóa", icon: "📦" },
   { value: "Overcharging", label: "Tính phí quá cao", icon: "💰" },
   { value: "UnsafeDriving", label: "Lái xe không an toàn", icon: "🚗" },
   { value: "NoShow", label: "Không đến đúng giờ", icon: "❌" },
   { value: "Other", label: "Khác", icon: "📝" }
];

const SEVERITY_LEVELS = [
   { value: "Low", label: "Thấp", color: "green" },
   { value: "Medium", label: "Trung bình", color: "orange" },
   { value: "High", label: "Cao", color: "red" },
   { value: "Critical", label: "Nghiêm trọng", color: "purple" }
];

const ReportViolationModal = ({
   open,
   onClose,
   driver,
   order = null,
   orderItem = null,
   onSuccess
}) => {
   const [form] = Form.useForm();
   const [submitting, setSubmitting] = useState(false);
   const [fileList, setFileList] = useState([]);

   const handleSubmit = async (values) => {
      setSubmitting(true);
      try {
         const payload = {
            driverId: driver?._id || null,
            orderId: order?._id || null,
            orderItemId: orderItem?._id || null,
            violationType: values.violationType,
            description: values.description,
            photos: fileList.map(file => file.response?.url || file.url).filter(Boolean),
            severity: values.severity || 'Medium',
            isAnonymous: values.isAnonymous || false
         };

         if (!payload.driverId && order) {
            const deliveredItem = order.items.find(item => item.status === 'Delivered' && item.driverId);
            if (deliveredItem) {
               payload.driverId = deliveredItem.driverId;
            }
         }

         if (!payload.driverId) {
            message.error('Không tìm thấy tài xế cho đơn hàng này');
            setSubmitting(false);
            return;
         }

         const response = await violationService.reportViolation(payload);
         if (response.data?.success) {
            message.success('Báo cáo vi phạm đã được gửi thành công!');
            form.resetFields();
            setFileList([]);
            onSuccess?.(response.data.data);
            onClose();
         } else {
            message.error(response.data?.message || 'Có lỗi xảy ra');
         }
      } catch (error) {
         message.error(error.response?.data?.message || 'Có lỗi xảy ra khi báo cáo');
      } finally {
         setSubmitting(false);
      }
   };

   const handleCancel = () => {
      form.resetFields();
      setFileList([]);
      onClose();
   };

   const uploadProps = {
      name: 'file',
      multiple: true,
      fileList,
      beforeUpload: (file) => {
         const isImage = file.type.startsWith('image/');
         if (!isImage) {
            message.error('Chỉ được upload ảnh!');
            return false;
         }
         const isLt2M = file.size / 1024 / 1024 < 2;
         if (!isLt2M) {
            message.error('Ảnh phải nhỏ hơn 2MB!');
            return false;
         }
         return true;
      },
      onChange: ({ fileList: newFileList }) => {
         setFileList(newFileList);
      },
      onRemove: (file) => {
         setFileList(fileList.filter(item => item.uid !== file.uid));
      },
      customRequest: async ({ file, onSuccess, onError }) => {
         try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload/image', {
               method: 'POST',
               body: formData,
               headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
               }
            });

            if (response.ok) {
               const result = await response.json();
               onSuccess(result);
            } else {
               onError(new Error('Upload failed'));
            }
         } catch (error) {
            onError(error);
         }
      }
   };

   if (!driver) return null;

   return (
      <Modal
         title={
            <div className="flex items-center">
               <ExclamationCircleOutlined className="text-red-500 mr-2" />
               <span>Khách hàng Báo cáo vi phạm tài xế</span>
            </div>
         }
         open={open}
         onCancel={handleCancel}
         footer={null}
         width={600}
         centered
      >
         <Alert
            message="Thông tin quan trọng"
            description="Báo cáo vi phạm sẽ được xem xét bởi đội ngũ admin. Vui lòng cung cấp thông tin chính xác và có bằng chứng."
            type="warning"
            showIcon
            className="mb-4"
         />

         <div className="mb-4">
            <Card size="small" className="bg-gray-50">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="font-medium">Tài xế: {driver.userId?.name || 'N/A'}</p>
                     <p className="text-sm text-gray-600">
                        SĐT: {driver.userId?.phone || 'N/A'}
                     </p>
                  </div>
                  {order && (
                     <div className="text-right">
                        <p className="text-sm text-gray-500">Đơn hàng</p>
                        <p className="font-medium">#{order._id?.slice(-8)}</p>
                     </div>
                  )}
               </div>
            </Card>
         </div>

         <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
               severity: 'Medium',
               isAnonymous: false
            }}
         >
            {/* Loại vi phạm */}
            <Form.Item
               name="violationType"
               label="Loại vi phạm"
               rules={[{ required: true, message: "Vui lòng chọn loại vi phạm" }]}
            >
               <Select placeholder="Chọn loại vi phạm">
                  {VIOLATION_TYPES.map(type => (
                     <Option key={type.value} value={type.value}>
                        <span className="mr-2">{type.icon}</span>
                        {type.label}
                     </Option>
                  ))}
               </Select>
            </Form.Item>

            {/* Mức độ nghiêm trọng */}
            <Form.Item
               name="severity"
               label="Mức độ nghiêm trọng"
               rules={[{ required: true, message: "Vui lòng chọn mức độ nghiêm trọng" }]}
            >
               <Select placeholder="Chọn mức độ nghiêm trọng">
                  {SEVERITY_LEVELS.map(level => (
                     <Option key={level.value} value={level.value}>
                        <span className={`text-${level.color}-500`}>
                           {level.label}
                        </span>
                     </Option>
                  ))}
               </Select>
            </Form.Item>

            {/* Mô tả chi tiết */}
            <Form.Item
               name="description"
               label="Mô tả chi tiết"
               rules={[
                  { required: true, message: "Vui lòng mô tả chi tiết vi phạm" },
                  { min: 20, message: "Mô tả phải có ít nhất 20 ký tự" },
                  { max: 1000, message: "Mô tả không được quá 1000 ký tự" }
               ]}
            >
               <TextArea
                  rows={4}
                  placeholder="Hãy mô tả chi tiết về vi phạm của tài xế. Bao gồm thời gian, địa điểm và những gì đã xảy ra..."
                  maxLength={1000}
                  showCount
               />
            </Form.Item>

            {/* Upload ảnh chứng minh */}
            <Form.Item label={
               <span>
                  📸 Ảnh chứng minh (tùy chọn)
                  <span className="text-xs text-gray-500 ml-2 font-normal">
                     - Tối đa 5 ảnh, mỗi ảnh &lt; 2MB
                  </span>
               </span>
            }>
               <Upload
                  {...uploadProps}
                  listType="picture-card"
                  maxCount={5}
               >
                  {fileList.length >= 5 ? null : (
                     <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                     </div>
                  )}
               </Upload>
               <Alert
                  message="💡 Mẹo"
                  description="Ảnh chứng cứ rõ ràng sẽ giúp admin xử lý báo cáo nhanh hơn và chính xác hơn."
                  type="info"
                  showIcon
                  className="mt-2"
               />
            </Form.Item>

            {/* Nút submit */}
            <div className="flex justify-end gap-2">
               <Button onClick={handleCancel}>
                  Hủy
               </Button>
               <Button
                  type="primary"
                  danger
                  htmlType="submit"
                  loading={submitting}
                  icon={<WarningOutlined />}
               >
                  Gửi báo cáo
               </Button>
            </div>
         </Form>
      </Modal>
   );
};

export default ReportViolationModal;
