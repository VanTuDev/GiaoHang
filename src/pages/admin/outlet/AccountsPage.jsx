import React from "react";
import { Table } from "antd";

const AccountsPage = () => {
   const data = [
      { key: 1, name: "Nguyễn Văn A", email: "a@gmail.com", role: "Customer" },
      { key: 2, name: "Trần Văn B", email: "b@gmail.com", role: "Driver" },
   ];

   const columns = [
      { title: "Tên", dataIndex: "name" },
      { title: "Email", dataIndex: "email" },
      { title: "Vai trò", dataIndex: "role" },
   ];

   return (
      <div>
         <h2 className="text-xl font-semibold mb-4">Quản lý tài khoản</h2>
         <Table dataSource={data} columns={columns} pagination={false} bordered />
      </div>
   );
};

export default AccountsPage;