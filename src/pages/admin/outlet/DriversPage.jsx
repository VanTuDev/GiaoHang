import React, { useEffect, useState } from "react";
import {
   List,
   Avatar,
   Button,
   Tag,
   message,
   Select,
   Input,
   Space,
   Card,
   Row,
   Col,
   Statistic,
   Badge,
   Divider,
   Modal,
   Descriptions,
   Spin,
   Alert
} from "antd";
import {
   CarOutlined,
   CheckOutlined,
   CloseOutlined,
   EyeOutlined,
   UserOutlined,
   PhoneOutlined,
   MailOutlined,
   HomeOutlined,
   ClockCircleOutlined,
   CheckCircleOutlined,
   ExclamationCircleOutlined,
   FileTextOutlined,
   SearchOutlined,
   FilterOutlined
} from "@ant-design/icons";
import { driverService } from "../../../features/driver/api/driverService";
import { adminService } from "../../../features/admin/api/adminService";
import DriverApplicationModal from "./components/DriverApplicationModal";

const DriversPage = () => {
   const [loading, setLoading] = useState(false);
   const [apps, setApps] = useState([]);
   const [viewing, setViewing] = useState(null);
   const [viewLoading, setViewLoading] = useState(false);
   const [adminNote, setAdminNote] = useState("");
   const [reviewLoading, setReviewLoading] = useState(false);
   const [status, setStatus] = useState("Pending");
   const [page, setPage] = useState(1);
   const [search, setSearch] = useState("");
   const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
   const [reviewModalVisible, setReviewModalVisible] = useState(false);
   const [selectedApp, setSelectedApp] = useState(null);

   const fetchApps = async () => {
      setLoading(true);
      try {
         const res = await driverService.adminList({ status, page, limit: 10, search });
         const raw = res.data?.data || [];
         const enriched = await Promise.all(
            raw.map(async (app) => {
               const userId = app?.userId || app?.user?._id;
               if (!userId) return app;
               try {
                  const uRes = await adminService.getUser(userId);
                  const detail = uRes.data?.data;
                  return {
                     ...app,
                     user: detail?.user || app.user,
                     driver: detail?.driver,
                     vehicles: detail?.vehicles || [],
                     stats: detail?.stats || {}
                  };
               } catch {
                  return app;
               }
            })
         );
         setApps(enriched);

         // Fetch stats
         await fetchStats();
      } catch (e) {
         message.error("Không thể tải danh sách yêu cầu");
      } finally {
         setLoading(false);
      }
   };

   const fetchStats = async () => {
      try {
         const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
            driverService.adminList({ status: "Pending", limit: 1 }),
            driverService.adminList({ status: "Approved", limit: 1 }),
            driverService.adminList({ status: "Rejected", limit: 1 })
         ]);

         setStats({
            pending: pendingRes.data?.total || 0,
            approved: approvedRes.data?.total || 0,
            rejected: rejectedRes.data?.total || 0
         });
      } catch (e) {
         console.error("Lỗi khi tải thống kê:", e);
      }
   };

   useEffect(() => {
      fetchApps();
   }, [status, page, search]);

   const handleReview = async (action) => {
      if (!selectedApp) return;

      try {
         setReviewLoading(true);
         await driverService.adminReview(selectedApp._id, { action, adminNote });
         message.success(`Đã ${action === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu`);
         setReviewModalVisible(false);
         setSelectedApp(null);
         setAdminNote("");
         fetchApps();
      } catch (e) {
         message.error("Thao tác thất bại");
      } finally {
         setReviewLoading(false);
      }
   };

   const openReviewModal = (app) => {
      setSelectedApp(app);
      setAdminNote(app.adminNote || "");
      setReviewModalVisible(true);
   };

   const getStatusConfig = (status) => {
      switch (status) {
         case 'Pending':
            return { color: 'orange', icon: <ClockCircleOutlined />, text: 'Chờ duyệt' };
         case 'Approved':
            return { color: 'green', icon: <CheckCircleOutlined />, text: 'Đã duyệt' };
         case 'Rejected':
            return { color: 'red', icon: <ExclamationCircleOutlined />, text: 'Đã từ chối' };
         default:
            return { color: 'default', icon: <ClockCircleOutlined />, text: status };
      }
   };

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-3xl font-bold mb-2">Quản lý yêu cầu tài xế</h1>
                  <p className="text-blue-100">Duyệt và quản lý các yêu cầu đăng ký tài xế</p>
               </div>
               <div className="text-right">
                  <div className="text-4xl font-bold">{stats.pending + stats.approved + stats.rejected}</div>
                  <p className="text-blue-100">Tổng yêu cầu</p>
               </div>
            </div>
         </div>

         {/* Stats Cards */}
         <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
               <Card className="text-center hover:shadow-lg transition-shadow">
                  <Statistic
                     title="Chờ duyệt"
                     value={stats.pending}
                     prefix={<ClockCircleOutlined />}
                     valueStyle={{ color: '#fa8c16' }}
                  />
               </Card>
            </Col>
            <Col xs={24} sm={8}>
               <Card className="text-center hover:shadow-lg transition-shadow">
                  <Statistic
                     title="Đã duyệt"
                     value={stats.approved}
                     prefix={<CheckCircleOutlined />}
                     valueStyle={{ color: '#52c41a' }}
                  />
               </Card>
            </Col>
            <Col xs={24} sm={8}>
               <Card className="text-center hover:shadow-lg transition-shadow">
                  <Statistic
                     title="Đã từ chối"
                     value={stats.rejected}
                     prefix={<ExclamationCircleOutlined />}
                     valueStyle={{ color: '#ff4d4f' }}
                  />
               </Card>
            </Col>
         </Row>

         {/* Filters */}
         <Card className="shadow-sm">
            <Row gutter={[16, 16]}>
               <Col xs={24} md={8}>
                  <Select
                     value={status}
                     onChange={setStatus}
                     style={{ width: "100%" }}
                     size="large"
                     options={[
                        { value: "Pending", label: "Chờ duyệt" },
                        { value: "Approved", label: "Đã duyệt" },
                        { value: "Rejected", label: "Đã từ chối" },
                     ]}
                  />
               </Col>
               <Col xs={24} md={12}>
                  <Input.Search
                     allowClear
                     placeholder="Tìm theo tên/email/số điện thoại"
                     onSearch={setSearch}
                     size="large"
                     prefix={<SearchOutlined />}
                  />
               </Col>
               <Col xs={24} md={4}>
                  <Button
                     type="primary"
                     icon={<FilterOutlined />}
                     size="large"
                     block
                  >
                     Lọc ({apps.length})
                  </Button>
               </Col>
            </Row>
         </Card>

         {/* Applications List */}
         <div className="space-y-4">
            {loading ? (
               <div className="flex justify-center py-10">
                  <Spin size="large" tip="Đang tải danh sách yêu cầu..." />
               </div>
            ) : apps.length > 0 ? (
               apps.map((app) => {
                  const statusConfig = getStatusConfig(app.status);
                  return (
                     <Card
                        key={app._id}
                        className={`shadow-lg hover:shadow-xl transition-shadow ${app.status === 'Pending' ? 'border-l-4 border-l-orange-500' :
                           app.status === 'Approved' ? 'border-l-4 border-l-green-500' :
                              'border-l-4 border-l-red-500'
                           }`}
                     >
                        <div className="space-y-4">
                           {/* Header */}
                           <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                 <Avatar
                                    src={app?.docs?.portraitUrl || app?.user?.avatarUrl}
                                    icon={<UserOutlined />}
                                    size={64}
                                    className="bg-blue-100"
                                 />
                                 <div>
                                    <h3 className="text-xl font-semibold">{app?.user?.name || "N/A"}</h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                       <Tag color={statusConfig.color} icon={statusConfig.icon}>
                                          {statusConfig.text}
                                       </Tag>
                                       <span className="text-sm text-gray-500">
                                          ID: {app?.user?._id || app?.userId || "N/A"}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                 <Button
                                    icon={<EyeOutlined />}
                                    onClick={async () => {
                                       setViewing({ _id: app._id, user: app.user, status: app.status });
                                       setViewLoading(true);
                                       try {
                                          const appRes = await driverService.adminGetOne(app._id);
                                          const appData = appRes.data?.data || app;
                                          const userId = appData?.userId || appData?.user?._id;
                                          if (userId) {
                                             const [uRes] = await Promise.all([
                                                adminService.getUser(userId),
                                             ]);
                                             const detail = uRes.data?.data;
                                             setViewing({
                                                ...appData,
                                                user: detail?.user || appData.user,
                                                driver: detail?.driver,
                                                vehicles: detail?.vehicles || [],
                                                stats: detail?.stats || {}
                                             });
                                          } else {
                                             setViewing(appData);
                                          }
                                       } catch {
                                          setViewing(app);
                                       } finally {
                                          setViewLoading(false);
                                       }
                                    }}
                                 >
                                    Xem chi tiết
                                 </Button>
                                 {app.status === 'Pending' && (
                                    <Button
                                       type="primary"
                                       icon={<CheckOutlined />}
                                       onClick={() => openReviewModal(app)}
                                       className="bg-green-600 hover:bg-green-700"
                                    >
                                       Duyệt
                                    </Button>
                                 )}
                              </div>
                           </div>

                           {/* User Info */}
                           <div className="bg-gray-50 p-4 rounded-lg">
                              <Row gutter={[16, 16]}>
                                 <Col xs={24} sm={8}>
                                    <div className="space-y-2">
                                       <div className="flex items-center space-x-2">
                                          <MailOutlined className="text-blue-500" />
                                          <span className="font-medium">Email</span>
                                       </div>
                                       <p className="text-sm">{app?.user?.email || "N/A"}</p>
                                    </div>
                                 </Col>
                                 <Col xs={24} sm={8}>
                                    <div className="space-y-2">
                                       <div className="flex items-center space-x-2">
                                          <PhoneOutlined className="text-green-500" />
                                          <span className="font-medium">Số điện thoại</span>
                                       </div>
                                       <p className="text-sm">{app?.user?.phone || "N/A"}</p>
                                    </div>
                                 </Col>
                                 <Col xs={24} sm={8}>
                                    <div className="space-y-2">
                                       <div className="flex items-center space-x-2">
                                          <HomeOutlined className="text-purple-500" />
                                          <span className="font-medium">Địa chỉ</span>
                                       </div>
                                       <p className="text-sm">{app?.user?.address || "N/A"}</p>
                                    </div>
                                 </Col>
                              </Row>
                           </div>

                           {/* Admin Note */}
                           {app.adminNote && (
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                 <div className="flex items-center space-x-2 mb-1">
                                    <FileTextOutlined className="text-blue-500" />
                                    <span className="font-medium text-blue-700">Ghi chú của admin</span>
                                 </div>
                                 <p className="text-sm text-blue-600">{app.adminNote}</p>
                              </div>
                           )}
                        </div>
                     </Card>
                  );
               })
            ) : (
               <Card className="text-center">
                  <div className="py-8">
                     <CarOutlined className="text-6xl text-gray-400 mb-4" />
                     <h3 className="text-lg font-medium text-gray-600 mb-2">Không có yêu cầu nào</h3>
                     <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  </div>
               </Card>
            )}
         </div>

         {/* Driver Application Modal */}
         <DriverApplicationModal
            open={!!viewing}
            onClose={() => setViewing(null)}
            viewing={viewing}
            loading={viewLoading}
         />

         {/* Review Modal */}
         <Modal
            title={
               <div className="flex items-center space-x-2">
                  <CheckOutlined className="text-green-500" />
                  <span>Duyệt yêu cầu tài xế</span>
               </div>
            }
            open={reviewModalVisible}
            onCancel={() => setReviewModalVisible(false)}
            footer={null}
            width={600}
         >
            {selectedApp && (
               <div className="space-y-4">
                  <Alert
                     message="Xác nhận duyệt yêu cầu"
                     description={`Bạn có chắc chắn muốn duyệt yêu cầu của ${selectedApp.user?.name} không?`}
                     type="info"
                     showIcon
                  />

                  <div className="bg-gray-50 p-4 rounded-lg">
                     <h4 className="font-medium mb-2">Thông tin ứng viên</h4>
                     <Descriptions column={1} size="small">
                        <Descriptions.Item label="Họ tên">{selectedApp.user?.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{selectedApp.user?.email}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{selectedApp.user?.phone}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">{selectedApp.user?.address || "N/A"}</Descriptions.Item>
                     </Descriptions>
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-2">Ghi chú (tùy chọn)</label>
                     <Input.TextArea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Nhập ghi chú hoặc lý do..."
                        rows={3}
                     />
                  </div>

                  <div className="flex justify-end space-x-2">
                     <Button onClick={() => setReviewModalVisible(false)}>
                        Hủy
                     </Button>
                     <Button
                        danger
                        icon={<CloseOutlined />}
                        loading={reviewLoading}
                        onClick={() => handleReview('reject')}
                     >
                        Từ chối
                     </Button>
                     <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        loading={reviewLoading}
                        onClick={() => handleReview('approve')}
                        className="bg-green-600 hover:bg-green-700"
                     >
                        Duyệt
                     </Button>
                  </div>
               </div>
            )}
         </Modal>
      </div>
   );
};

export default DriversPage;
