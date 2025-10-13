import React, { useEffect, useState } from "react";
import { Table, message, Modal, Descriptions, Avatar, Button, Tag } from "antd";
import { adminService } from "../../../features/admin/api/adminService";
import { driverService } from "../../../features/driver/api/driverService";

const AccountsPage = () => {
   const [loading, setLoading] = useState(false);
   const [data, setData] = useState([]);
   const [viewing, setViewing] = useState(null);

   const fetchUsers = async () => {
      setLoading(true);
      try {
         const res = await adminService.listUsers();
         setData((res.data?.data || []).map((u) => ({ key: u._id, ...u })));
      } catch (e) {
         message.error("Không thể tải danh sách người dùng");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchUsers();
   }, []);

   const columns = [
      { title: "Tên", dataIndex: "name" },
      { title: "Email", dataIndex: "email" },
      { title: "SĐT", dataIndex: "phone" },
      { title: "Vai trò", dataIndex: "role" },
      {
         title: "Thao tác",
         render: (_, record) => (
            <Button
               onClick={async () => {
                  try {
                     const id = record._id || record.key;
                     const [uRes, appsRes] = await Promise.all([
                        adminService.getUser(id),
                        driverService.adminList({ userId: id, limit: 10 }),
                     ]);
                     const detail = uRes.data?.data;
                     const user = detail?.user || record;
                     const driver = detail?.driver;
                     const vehicles = detail?.vehicles || [];
                     const stats = detail?.stats || {};
                     const applications = appsRes.data?.data || [];
                     setViewing({ user, driver, vehicles, stats, applications });
                  } catch (e) {
                     message.error("Không lấy được chi tiết người dùng");
                  }
               }}
            >
               Xem
            </Button>
         ),
      },
   ];

   return (
      <div>
         <h2 className="text-xl font-semibold mb-4">Quản lý tài khoản</h2>
         <Table loading={loading} dataSource={data} columns={columns} pagination={{ pageSize: 10 }} bordered />
         <Modal open={!!viewing} onCancel={() => setViewing(null)} footer={null} title="Chi tiết người dùng" width={900} centered styles={{ body: { maxHeight: '75vh', overflowY: 'auto', paddingRight: 8 } }}>
            {viewing && (
               <div className="max-h-[70vh] overflow-y-auto pr-1">
                  <Descriptions bordered column={1} size="small">
                     <Descriptions.Item label="Avatar">
                        <Avatar src={viewing.user?.avatarUrl} size={64} />
                     </Descriptions.Item>
                     <Descriptions.Item label="Họ tên">{viewing.user?.name}</Descriptions.Item>
                     <Descriptions.Item label="Email">{viewing.user?.email}</Descriptions.Item>
                     <Descriptions.Item label="SĐT">{viewing.user?.phone}</Descriptions.Item>
                     <Descriptions.Item label="Vai trò chính">{viewing.user?.role}</Descriptions.Item>
                     <Descriptions.Item label="Tất cả roles">{Array.isArray(viewing.user?.roles) ? viewing.user.roles.join(", ") : (viewing.user?.roles || "")}</Descriptions.Item>
                     <Descriptions.Item label="Địa chỉ">{viewing.user?.address}</Descriptions.Item>
                     <Descriptions.Item label="Xác thực email">{viewing.user?.isEmailVerified ? "Đã xác thực" : "Chưa"}</Descriptions.Item>
                     <Descriptions.Item label="Tạo lúc">{viewing.user?.createdAt ? new Date(viewing.user.createdAt).toLocaleString() : ""}</Descriptions.Item>
                     <Descriptions.Item label="Cập nhật lúc">{viewing.user?.updatedAt ? new Date(viewing.user.updatedAt).toLocaleString() : ""}</Descriptions.Item>
                     <Descriptions.Item label="User ID">{viewing.user?._id}</Descriptions.Item>
                     {viewing.driver ? (
                        <Descriptions.Item label="Driver status">{viewing.driver.status}</Descriptions.Item>
                     ) : null}
                     {(viewing.stats?.orders || viewing.stats?.driver) ? (
                        <Descriptions.Item label="Thống kê">
                           <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(viewing.stats, null, 2)}</pre>
                        </Descriptions.Item>
                     ) : null}
                  </Descriptions>

                  {Array.isArray(viewing.applications) && viewing.applications.length > 0 ? (
                     <div className="mt-4">
                        <h4 className="mb-2 font-semibold">Hồ sơ tài xế đã nộp</h4>
                        {viewing.applications.map((app) => (
                           <div key={app._id} className="mb-3 rounded border border-gray-200 p-3">
                              <div className="mb-2 flex items-center gap-2">
                                 <span className="font-medium">Application ID:</span>
                                 <span>{app._id}</span>
                                 <Tag>{app.status}</Tag>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                 {app.docs && [
                                    app.docs.licenseFrontUrl,
                                    app.docs.licenseBackUrl,
                                    app.docs.idCardFrontUrl,
                                    app.docs.idCardBackUrl,
                                    app.docs.portraitUrl,
                                    ...(app.docs.vehiclePhotos || []),
                                    ...(app.docs.vehicleDocs || []),
                                 ].filter(Boolean).map((url, idx) => (
                                    <a key={idx} href={url} target="_blank" rel="noreferrer">
                                       <img src={url} alt="doc" className="h-20 w-full rounded object-cover" />
                                    </a>
                                 ))}
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : null}
                  {Array.isArray(viewing.vehicles) && viewing.vehicles.length > 0 ? (
                     <div className="mt-4">
                        <h4 className="mb-2 font-semibold">Xe của người dùng (nếu là tài xế)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                           {viewing.vehicles.map((v) => (
                              <div key={v._id} className="flex items-center gap-12">
                                 <img src={v.photoUrl} alt={v.type} className="w-28 h-20 object-cover rounded" />
                                 <div>
                                    <div className="font-medium">{v.type} - {v.licensePlate}</div>
                                    <div className="text-sm text-gray-500">Tải trọng: {v.maxWeightKg}kg</div>
                                    <Tag color={v.status === 'Active' ? 'green' : 'default'}>{v.status || 'N/A'}</Tag>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ) : null}
               </div>
            )}
         </Modal>
      </div>
   );
};

export default AccountsPage;