import React from "react";
import { Card, Tag } from "antd";

export default function VehicleTypeCard({ data, onClick }) {
   return (
      <Card
         hoverable
         cover={data.sampleImage ? <img alt={data.label || data.type} src={data.sampleImage} className="h-40 object-cover" /> : null}
         onClick={onClick}
      >
         <div className="font-semibold mb-1">{data.label || data.type}</div>
         <div className="text-sm text-gray-600">Tải tối đa: <Tag color="green">{data.maxWeightKg} kg</Tag></div>
      </Card>
   );
}


