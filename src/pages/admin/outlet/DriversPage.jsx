import React, { useEffect, useState } from "react";
import { List, Avatar, Button, Tag, message, Select, Input, Space } from "antd";
import { CarOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
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
                  return { ...app, user: uRes.data?.data || app.user };
               } catch {
                  return app;
               }
            })
         );
         setApps(enriched);
      } catch (e) {
         message.error("Không thể tải danh sách yêu cầu");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchApps();
   }, [status, page, search]);

   return (
      <div>
         <h2 className="text-xl font-semibold mb-4">Yêu cầu lên Tài xế</h2>
         <div className="mb-3 flex items-center gap-2">
            <Select
               value={status}
               onChange={setStatus}
               options={[
                  { value: "Pending", label: "Pending" },
                  { value: "Approved", label: "Approved" },
                  { value: "Rejected", label: "Rejected" },
               ]}
            />
            <Input.Search allowClear placeholder="Tìm theo tên/email/phone" onSearch={setSearch} style={{ maxWidth: 280 }} />
         </div>
         <List
            loading={loading}
            itemLayout="horizontal"
            dataSource={apps}
            renderItem={(a) => (
               <List.Item actions={[
                  <Button key="view" onClick={async () => {
                     setViewing({ _id: a._id, user: a.user, status: a.status });
                     setAdminNote(a.adminNote || "");
                     setViewLoading(true);
                     try {
                        const appRes = await driverService.adminGetOne(a._id);
                        const app = appRes.data?.data || a;
                        const userId = app?.userId || app?.user?._id;
                        if (userId) {
                           const [uRes] = await Promise.all([
                              adminService.getUser(userId),
                           ]);
                           setViewing({ ...app, user: uRes.data?.data || app.user });
                        } else {
                           setViewing(app);
                        }
                     } catch {
                        setViewing(a);
                     } finally {
                        setViewLoading(false);
                     }
                  }}>Xem</Button>
               ]}>
                  <List.Item.Meta
                     avatar={<Avatar src={a?.docs?.portraitUrl || a?.user?.avatarUrl} icon={<CarOutlined />} />}
                     title={<div className="flex items-center gap-2">{a?.user?.name} <Tag>{a?.status || "Pending"}</Tag></div>}
                     description={<div className="text-sm text-gray-700">
                        <div><span className="font-medium">Họ tên:</span> {a?.user?.name || ""}</div>
                        <div><span className="font-medium">Email:</span> {a?.user?.email || ""}</div>
                        <div><span className="font-medium">SĐT:</span> {a?.user?.phone || ""}</div>
                        <div><span className="font-medium">User ID:</span> {a?.user?._id || a?.userId || ""}</div>
                        {a?.user?.address ? <div><span className="font-medium">Địa chỉ:</span> {a.user.address}</div> : null}
                     </div>}
                  />
               </List.Item>
            )}
         />
         <DriverApplicationModal open={!!viewing} onClose={() => setViewing(null)} viewing={viewing} loading={viewLoading} />
         {viewing ? (
            <div className="mt-3 flex justify-end">
               <Space>
                  <Input.TextArea
                     value={adminNote}
                     onChange={(e) => setAdminNote(e.target.value)}
                     placeholder="Ghi chú/ lý do"
                     autoSize={{ minRows: 1, maxRows: 3 }}
                     style={{ width: 280 }}
                  />
                  <Button
                     danger
                     icon={<CloseOutlined />}
                     loading={reviewLoading}
                     onClick={async () => {
                        try {
                           setReviewLoading(true);
                           await driverService.adminReview(viewing._id, { action: "reject", adminNote });
                           message.success("Đã từ chối");
                           setViewing(null);
                           fetchApps();
                        } catch {
                           message.error("Thao tác thất bại");
                        } finally {
                           setReviewLoading(false);
                        }
                     }}
                  >
                     Từ chối
                  </Button>
                  <Button
                     type="primary"
                     className="!bg-green-700"
                     icon={<CheckOutlined />}
                     loading={reviewLoading}
                     onClick={async () => {
                        try {
                           setReviewLoading(true);
                           await driverService.adminReview(viewing._id, { action: "approve", adminNote });
                           message.success("Đã duyệt");
                           setViewing(null);
                           fetchApps();
                        } catch {
                           message.error("Thao tác thất bại");
                        } finally {
                           setReviewLoading(false);
                        }
                     }}
                  >
                     Duyệt
                  </Button>
               </Space>
            </div>
         ) : null}
      </div>
   );
};

export default DriversPage;
