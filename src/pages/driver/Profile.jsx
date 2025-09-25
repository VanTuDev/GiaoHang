import React, { useState, useEffect } from 'react';
import {
   Card,
   Form,
   Input,
   Button,
   Tabs,
   Spin,
   Alert,
   Avatar,
   Tag,
   Row,
   Col,
   Statistic,
   message,
   Upload,
   Descriptions,
   Image
} from 'antd';
import {
   UserOutlined,
   MailOutlined,
   PhoneOutlined,
   StarFilled,
   DollarCircleOutlined,
   UploadOutlined,
   IdcardOutlined,
   CheckCircleOutlined,
   CloseCircleOutlined
} from '@ant-design/icons';
import { driverService } from '../../features/driver/api/driverService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { uploadToCloudinary } from '../../utils/cloudinaryService';

const { TabPane } = Tabs;

export default function DriverProfile() {
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState(null);
   const [profile, setProfile] = useState(null);
   const [driverInfo, setDriverInfo] = useState(null);
   const [application, setApplication] = useState(null);
   const [activeTab, setActiveTab] = useState('profile');
   const [avatarUrl, setAvatarUrl] = useState(null);
   const [fileList, setFileList] = useState([]);
   const [uploadingAvatar, setUploadingAvatar] = useState(false);

   // Tải thông tin tài xế
   useEffect(() => {
      const fetchDriverProfile = async () => {
         setLoading(true);
         setError(null);

         try {
            // Tải thông tin người dùng
            const profileResponse = await driverService.getDriverInfo();
            if (profileResponse.data?.success) {
               const driverData = profileResponse.data.data;
               setDriverInfo(driverData);

               // Lấy thông tin cơ bản từ driverData
               setProfile({
                  name: driverData.userId?.name || '',
                  email: driverData.userId?.email || '',
                  phone: driverData.userId?.phone || '',
                  address: driverData.userId?.address || '',
                  rating: driverData.rating || 5.0,
                  totalTrips: driverData.totalTrips || 0,
                  incomeBalance: driverData.incomeBalance || 0,
                  isActive: driverData.isOnline || false,
                  avatarUrl: driverData.avatarUrl || driverData.userId?.avatarUrl
               });

               // Cập nhật form với thông tin người dùng
               form.setFieldsValue({
                  name: driverData.userId?.name || '',
                  email: driverData.userId?.email || '',
                  phone: driverData.userId?.phone || '',
                  address: driverData.userId?.address || ''
               });

               // Cập nhật avatar URL
               if (driverData.avatarUrl || driverData.userId?.avatarUrl) {
                  setAvatarUrl(driverData.avatarUrl || driverData.userId?.avatarUrl);
               }
            }

            // Tải hồ sơ tài xế
            const applicationResponse = await driverService.myApplication();
            if (applicationResponse.data?.success) {
               setApplication(applicationResponse.data.data);
            }

            setLoading(false);
         } catch (error) {
            console.error("Lỗi khi tải thông tin tài xế:", error);
            setError("Không thể tải thông tin tài xế. Vui lòng thử lại sau.");
            setLoading(false);
         }
      };

      fetchDriverProfile();
   }, [form]);

   // Xử lý cập nhật thông tin cá nhân
   const handleUpdateProfile = async (values) => {
      setSubmitting(true);

      try {
         const response = await driverService.updateProfile(values);

         if (response.data?.success) {
            setProfile({
               ...profile,
               ...values
            });
            message.success('Cập nhật thông tin thành công');
         } else {
            message.error('Không thể cập nhật thông tin: ' + (response.data?.message || 'Đã xảy ra lỗi'));
         }
      } catch (error) {
         console.error("Lỗi khi cập nhật thông tin:", error);
         message.error("Lỗi khi cập nhật thông tin: " + (error.response?.data?.message || error.message));
      } finally {
         setSubmitting(false);
      }
   };

   // Xử lý upload avatar
   const handleAvatarChange = async (info) => {
      if (info.file.status === 'uploading') {
         setUploadingAvatar(true);
         return;
      }

      if (info.file.status === 'done') {
         try {
            // Upload ảnh lên Cloudinary thông qua backend API
            const result = await uploadToCloudinary(info.file.originFileObj, 'avatars');

            // Cập nhật avatar trong database
            const response = await driverService.uploadAvatar({ avatarUrl: result.url });

            if (response.data?.success) {
               setAvatarUrl(result.url);
               setProfile({
                  ...profile,
                  avatarUrl: result.url
               });
               message.success('Cập nhật avatar thành công');
            } else {
               message.error('Không thể cập nhật avatar');
            }
         } catch (error) {
            console.error('Lỗi khi upload avatar:', error);
            message.error('Không thể upload avatar: ' + (error.message || 'Đã xảy ra lỗi'));
         } finally {
            setUploadingAvatar(false);
         }
      }
   };

   // Render trạng thái hồ sơ tài xế
   const renderApplicationStatus = (status) => {
      switch (status) {
         case 'Approved':
            return <Tag color="success" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
         case 'Rejected':
            return <Tag color="error" icon={<CloseCircleOutlined />}>Đã từ chối</Tag>;
         case 'Pending':
         default:
            return <Tag color="processing">Đang chờ duyệt</Tag>;
      }
   };

   return (
      <div>
         <h2 className="text-2xl font-bold mb-4">Hồ sơ tài xế</h2>

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

               <Tabs activeKey={activeTab} onChange={setActiveTab}>
                  <TabPane tab="Thông tin cá nhân" key="profile">
                     <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                           <Card className="text-center">
                              <Upload
                                 name="avatar"
                                 listType="picture-circle"
                                 className="avatar-uploader"
                                 showUploadList={false}
                                 beforeUpload={() => false}
                                 onChange={handleAvatarChange}
                              >
                                 {avatarUrl ? (
                                    <Avatar
                                       size={100}
                                       src={avatarUrl}
                                       className="mb-4"
                                    />
                                 ) : (
                                    <div>
                                       {uploadingAvatar ? <Spin /> : <UploadOutlined />}
                                       <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                    </div>
                                 )}
                              </Upload>
                              <h3 className="text-xl font-medium mb-2">{profile?.name}</h3>
                              <div className="flex items-center justify-center mb-2">
                                 <StarFilled className="text-yellow-500 mr-1" />
                                 <span>{profile?.rating || 5.0}</span>
                                 <span className="mx-2">•</span>
                                 <span>{profile?.totalTrips || 0} chuyến</span>
                              </div>
                              <div className="mb-2">
                                 <Tag color={profile?.isActive ? "green" : "gray"}>
                                    {profile?.isActive ? "Đang hoạt động" : "Không hoạt động"}
                                 </Tag>
                              </div>
                              <div className="text-gray-500 mb-1">
                                 <PhoneOutlined className="mr-2" />
                                 {profile?.phone}
                              </div>
                              <div className="text-gray-500">
                                 <MailOutlined className="mr-2" />
                                 {profile?.email}
                              </div>
                           </Card>

                           <Card className="mt-4">
                              <Statistic
                                 title="Số dư thu nhập"
                                 value={profile?.incomeBalance || 0}
                                 precision={0}
                                 valueStyle={{ color: '#3f8600' }}
                                 prefix={<DollarCircleOutlined />}
                                 formatter={(value) => formatCurrency(value)}
                              />
                           </Card>
                        </Col>

                        <Col xs={24} md={16}>
                           <Card title="Thông tin cá nhân">
                              <Form
                                 form={form}
                                 layout="vertical"
                                 onFinish={handleUpdateProfile}
                              >
                                 <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                       <Form.Item
                                          name="name"
                                          label="Họ và tên"
                                          rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                                       >
                                          <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
                                       </Form.Item>
                                    </Col>

                                    <Col xs={24} md={12}>
                                       <Form.Item
                                          name="phone"
                                          label="Số điện thoại"
                                          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                                       >
                                          <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
                                       </Form.Item>
                                    </Col>
                                 </Row>

                                 <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                       <Form.Item
                                          name="email"
                                          label="Email"
                                          rules={[
                                             { type: 'email', message: 'Email không hợp lệ' }
                                          ]}
                                       >
                                          <Input prefix={<MailOutlined />} placeholder="Email" readOnly />
                                       </Form.Item>
                                    </Col>

                                    <Col xs={24} md={12}>
                                       <Form.Item
                                          name="address"
                                          label="Địa chỉ"
                                       >
                                          <Input placeholder="Địa chỉ" />
                                       </Form.Item>
                                    </Col>
                                 </Row>

                                 <Form.Item>
                                    <Button
                                       type="primary"
                                       htmlType="submit"
                                       loading={submitting}
                                       className="bg-blue-600"
                                    >
                                       Cập nhật thông tin
                                    </Button>
                                 </Form.Item>
                              </Form>
                           </Card>
                        </Col>
                     </Row>
                  </TabPane>

                  <TabPane tab="Hồ sơ tài xế" key="application">
                     <Card>
                        {application ? (
                           <div>
                              <Descriptions title="Thông tin hồ sơ" bordered column={1}>
                                 <Descriptions.Item label="Trạng thái">
                                    {renderApplicationStatus(application.status)}
                                 </Descriptions.Item>
                                 <Descriptions.Item label="Ngày nộp">
                                    {formatDate(application.submittedAt)}
                                 </Descriptions.Item>
                                 {application.reviewedAt && (
                                    <Descriptions.Item label="Ngày duyệt">
                                       {formatDate(application.reviewedAt)}
                                    </Descriptions.Item>
                                 )}
                                 {application.adminNote && (
                                    <Descriptions.Item label="Ghi chú từ Admin">
                                       {application.adminNote}
                                    </Descriptions.Item>
                                 )}
                              </Descriptions>

                              <div className="mt-6">
                                 <h3 className="text-lg font-medium mb-3">Giấy tờ đã nộp</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {application.docs?.licenseFrontUrl && (
                                       <div>
                                          <p className="mb-2">Giấy phép lái xe (mặt trước)</p>
                                          <Image
                                             src={application.docs.licenseFrontUrl}
                                             alt="Giấy phép lái xe (mặt trước)"
                                             className="w-full h-40 object-cover rounded"
                                          />
                                       </div>
                                    )}
                                    {application.docs?.licenseBackUrl && (
                                       <div>
                                          <p className="mb-2">Giấy phép lái xe (mặt sau)</p>
                                          <Image
                                             src={application.docs.licenseBackUrl}
                                             alt="Giấy phép lái xe (mặt sau)"
                                             className="w-full h-40 object-cover rounded"
                                          />
                                       </div>
                                    )}
                                    {application.docs?.idCardFrontUrl && (
                                       <div>
                                          <p className="mb-2">CMND/CCCD (mặt trước)</p>
                                          <Image
                                             src={application.docs.idCardFrontUrl}
                                             alt="CMND/CCCD (mặt trước)"
                                             className="w-full h-40 object-cover rounded"
                                          />
                                       </div>
                                    )}
                                    {application.docs?.idCardBackUrl && (
                                       <div>
                                          <p className="mb-2">CMND/CCCD (mặt sau)</p>
                                          <Image
                                             src={application.docs.idCardBackUrl}
                                             alt="CMND/CCCD (mặt sau)"
                                             className="w-full h-40 object-cover rounded"
                                          />
                                       </div>
                                    )}
                                    {application.docs?.portraitUrl && (
                                       <div>
                                          <p className="mb-2">Ảnh chân dung</p>
                                          <Image
                                             src={application.docs.portraitUrl}
                                             alt="Ảnh chân dung"
                                             className="w-full h-40 object-cover rounded"
                                          />
                                       </div>
                                    )}
                                 </div>

                                 {Array.isArray(application.docs?.vehiclePhotos) && application.docs.vehiclePhotos.length > 0 && (
                                    <div className="mt-4">
                                       <h4 className="font-medium mb-2">Ảnh xe</h4>
                                       <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                          {application.docs.vehiclePhotos.map((url, index) => (
                                             <Image
                                                key={index}
                                                src={url}
                                                alt={`Ảnh xe ${index + 1}`}
                                                className="w-full h-24 object-cover rounded"
                                             />
                                          ))}
                                       </div>
                                    </div>
                                 )}

                                 {Array.isArray(application.docs?.vehicleDocs) && application.docs.vehicleDocs.length > 0 && (
                                    <div className="mt-4">
                                       <h4 className="font-medium mb-2">Giấy tờ xe</h4>
                                       <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                          {application.docs.vehicleDocs.map((url, index) => (
                                             <Image
                                                key={index}
                                                src={url}
                                                alt={`Giấy tờ xe ${index + 1}`}
                                                className="w-full h-24 object-cover rounded"
                                             />
                                          ))}
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>
                        ) : (
                           <div className="text-center py-10">
                              <IdcardOutlined className="text-gray-400 text-5xl mb-4" />
                              <p className="text-gray-600 mb-4">Bạn chưa nộp hồ sơ tài xế</p>
                              <Button type="primary" className="bg-blue-600">
                                 Nộp hồ sơ tài xế
                              </Button>
                           </div>
                        )}
                     </Card>
                  </TabPane>
               </Tabs>
            </>
         )}
      </div>
   );
}
