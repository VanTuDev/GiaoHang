import { useEffect, useState } from "react";
import { Table, message } from "antd";
import axiosClient from "../../authentication/api/axiosClient";

export default function AdminUsers() {
   const [loading, setLoading] = useState(false);
   const [users, setUsers] = useState([]);

   const fetchUsers = async () => {
      setLoading(true);
      try {
         const res = await axiosClient.get("/api/admin/users");
         console.log("[GET /api/admin/users]", res.data);
         setUsers(res.data?.data || []);
      } catch (e) {
         console.error(e);
         message.error("Không thể tải danh sách người dùng");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchUsers();
   }, []);

   const columns = [
      { title: "Họ tên", dataIndex: "name" },
      { title: "Email", dataIndex: "email" },
      { title: "SĐT", dataIndex: "phone" },
      { title: "Vai trò", dataIndex: "role" },
      { title: "Địa chỉ", dataIndex: "address" },
      { title: "Tạo lúc", dataIndex: "createdAt" },
   ];

   return (
      <div className="space-y-4">
         <h2 className="text-xl font-semibold text-green-700">Danh sách người dùng</h2>
         <Table rowKey="_id" loading={loading} dataSource={users} columns={columns} />
      </div>
   );
}


