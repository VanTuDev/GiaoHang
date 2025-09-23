import React from "react";
import { Modal, Table, Tag, Typography } from "antd";

const { Text } = Typography;

export default function OrderSummaryModal({ open, onClose, order }) {
   const columns = [
      { title: "Loại xe", dataIndex: "vehicleType" },
      { title: "Khối lượng (kg)", dataIndex: "weightKg" },
      { title: "Quãng đường (km)", dataIndex: "distanceKm" },
      {
         title: "Đơn giá (đ/km)",
         render: (_, r) => r?.priceBreakdown?.basePerKm?.toLocaleString("vi-VN") || "-",
      },
      {
         title: "Chi phí quãng đường",
         render: (_, r) => r?.priceBreakdown?.distanceCost?.toLocaleString("vi-VN") || "-",
      },
      {
         title: "Bốc hàng",
         render: (_, r) => (r?.priceBreakdown?.loadCost ? <Tag>{r.priceBreakdown.loadCost.toLocaleString("vi-VN")} đ</Tag> : "-")
      },
      {
         title: "Bảo hiểm",
         render: (_, r) => (r?.priceBreakdown?.insuranceFee ? <Tag>{r.priceBreakdown.insuranceFee.toLocaleString("vi-VN")} đ</Tag> : "-")
      },
      {
         title: "Tổng",
         render: (_, r) => <Text strong className="text-blue-700">{r?.priceBreakdown?.total?.toLocaleString("vi-VN") || "-"} đ</Text>,
      },
   ];

   const data = Array.isArray(order?.items) ? order.items.map((it) => ({ key: it._id, ...it })) : [];

   return (
      <Modal open={open} onCancel={onClose} onOk={onClose} title="Tóm tắt đơn hàng" okText="Đóng">
         <Table size="small" columns={columns} dataSource={data} pagination={false} />
         <div className="mt-3 text-right">
            <Text strong>Tổng tiền: <span className="text-green-700">{(order?.totalPrice || 0).toLocaleString("vi-VN")} đ</span></Text>
         </div>
      </Modal>
   );
}


