import React, { useState } from "react";
import { Modal, Form, Rate, Input, Upload, Button, message, Row, Col, Card, Divider } from "antd";
import {
   StarOutlined,
   UploadOutlined,
   DeleteOutlined,
   UserOutlined,
   CarOutlined,
   ClockCircleOutlined,
   CustomerServiceOutlined
} from "@ant-design/icons";
import { feedbackService } from "../../../features/feedback/api/feedbackService";

const { TextArea } = Input;

const FeedbackModal = ({
   open,
   onClose,
   order,
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
            orderId: order._id,
            orderItemId: orderItem?._id || null,
            overallRating: values.overallRating,
            serviceRating: values.serviceRating,
            driverRating: values.driverRating,
            vehicleRating: values.vehicleRating,
            punctualityRating: values.punctualityRating,
            comment: values.comment,
            photos: fileList.map(file => file.response?.url || file.url).filter(Boolean),
            isAnonymous: values.isAnonymous || false
         };

         const response = await feedbackService.createFeedback(payload);
         if (response.data?.success) {
            message.success('Đánh giá dịch vụ thành công!');
            form.resetFields();
            setFileList([]);
            onSuccess?.(response.data.data);
            onClose();
         } else {
            message.error(response.data?.message || 'Có lỗi xảy ra');
         }
      } catch (error) {
         message.error(error.response?.data?.message || 'Có lỗi xảy ra khi đánh giá');
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

   if (!order) return null;

   return (
      <Modal
         title={
            <div className="flex items-center">
               <StarOutlined className="text-yellow-500 mr-2" />
               <span>Đánh giá dịch vụ</span>
            </div>
         }
         open={open}
         onCancel={handleCancel}
         footer={null}
         width={700}
         centered
      >
         <div className="mb-4">
            <Card size="small" className="bg-gray-50">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="font-medium">Đơn hàng #{order._id?.slice(-8)}</p>
                     <p className="text-sm text-gray-600">
                        {order.pickupAddress} → {order.dropoffAddress}
                     </p>
                  </div>
                  <div className="text-right">
                     <p className="text-sm text-gray-500">Tổng giá trị</p>
                     <p className="font-medium">{order.totalPrice?.toLocaleString()}đ</p>
                  </div>
               </div>
            </Card>
         </div>

         <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
               overallRating: 5,
               serviceRating: 5,
               driverRating: 5,
               vehicleRating: 5,
               punctualityRating: 5
            }}
         >
            {/* Đánh giá tổng quan */}
            <Card title="Đánh giá tổng quan" className="mb-4">
               <Form.Item
                  name="overallRating"
                  label="Đánh giá tổng thể"
                  rules={[{ required: true, message: "Vui lòng đánh giá tổng thể" }]}
               >
                  <Rate
                     character={<StarOutlined />}
                     style={{ fontSize: 24 }}
                     tooltips={['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt']}
                  />
               </Form.Item>
            </Card>

            {/* Đánh giá chi tiết */}
            <Card title="Đánh giá chi tiết" className="mb-4">
               <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                     <Form.Item
                        name="serviceRating"
                        label={
                           <div className="flex items-center">
                              <CustomerServiceOutlined className="mr-1" />
                              Chất lượng dịch vụ
                           </div>
                        }
                     >
                        <Rate character={<StarOutlined />} />
                     </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                     <Form.Item
                        name="driverRating"
                        label={
                           <div className="flex items-center">
                              <UserOutlined className="mr-1" />
                              Thái độ tài xế
                           </div>
                        }
                     >
                        <Rate character={<StarOutlined />} />
                     </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                     <Form.Item
                        name="vehicleRating"
                        label={
                           <div className="flex items-center">
                              <CarOutlined className="mr-1" />
                              Tình trạng xe
                           </div>
                        }
                     >
                        <Rate character={<StarOutlined />} />
                     </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                     <Form.Item
                        name="punctualityRating"
                        label={
                           <div className="flex items-center">
                              <ClockCircleOutlined className="mr-1" />
                              Đúng giờ
                           </div>
                        }
                     >
                        <Rate character={<StarOutlined />} />
                     </Form.Item>
                  </Col>
               </Row>
            </Card>

            {/* Nhận xét */}
            <Card title="Nhận xét chi tiết" className="mb-4">
               <Form.Item
                  name="comment"
                  label="Chia sẻ trải nghiệm của bạn"
                  rules={[
                     { max: 1000, message: "Nhận xét không được quá 1000 ký tự" }
                  ]}
               >
                  <TextArea
                     rows={4}
                     placeholder="Hãy chia sẻ trải nghiệm của bạn về dịch vụ này..."
                     maxLength={1000}
                     showCount
                  />
               </Form.Item>

               {/* Upload ảnh */}
               <Form.Item label="Ảnh minh họa (tùy chọn)">
                  <Upload {...uploadProps}>
                     <Button icon={<UploadOutlined />}>
                        Upload ảnh
                     </Button>
                  </Upload>
                  <p className="text-xs text-gray-500 mt-1">
                     Tối đa 5 ảnh, mỗi ảnh dưới 2MB
                  </p>
               </Form.Item>
            </Card>

            {/* Nút submit */}
            <div className="flex justify-end gap-2">
               <Button onClick={handleCancel}>
                  Hủy
               </Button>
               <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  icon={<StarOutlined />}
               >
                  Gửi đánh giá
               </Button>
            </div>
         </Form>
      </Modal>
   );
};

export default FeedbackModal;
