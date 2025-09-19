import React from "react";
import { List, Avatar } from "antd";
import { CarOutlined } from "@ant-design/icons";

const DriversPage = () => {
   const drivers = [
      { id: 1, name: "Tài xế 1", phone: "0901234567", status: "Online" },
      { id: 2, name: "Tài xế 2", phone: "0909876543", status: "Offline" },
   ];

   return (
      <div>
         <h2 className="text-xl font-semibold mb-4">Quản lý tài xế</h2>
         <List
            itemLayout="horizontal"
            dataSource={drivers}
            renderItem={(d) => (
               <List.Item>
                  <List.Item.Meta
                     avatar={<Avatar icon={<CarOutlined />} />}
                     title={d.name}
                     description={`SĐT: ${d.phone} | Trạng thái: ${d.status}`}
                  />
               </List.Item>
            )}
         />
      </div>
   );
};

export default DriversPage;
