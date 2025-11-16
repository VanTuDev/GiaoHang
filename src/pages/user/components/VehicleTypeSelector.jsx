import React, { useState, useEffect } from "react";
import { Row, Col, Spin, Alert } from "antd";
import { vehicleService } from "../../../features/vehicles/api/vehicleService";
import VehicleTypeCard from "./VehicleTypeCard";

export default function VehicleTypeSelector({ onSelectType }) {
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [types, setTypes] = useState([]);

   useEffect(() => {
      const fetchVehicleTypes = async () => {
         setLoading(true);
         setError(null);
         try {
            const res = await vehicleService.getTypes();
            if (res.data?.success && Array.isArray(res.data.data)) {
               setTypes(res.data.data);
            } else {
               setError("Không thể tải danh sách loại xe");
            }
         } catch (err) {
            console.error("Lỗi khi tải danh sách loại xe:", err);
            setError("Lỗi kết nối: " + (err.message || "Không thể tải danh sách loại xe"));
         } finally {
            setLoading(false);
         }
      };

      fetchVehicleTypes();
   }, []);

   if (loading) {
      return (
         <div className="text-center py-8">
            <Spin size="large" />
         </div>
      );
   }

   if (error) {
      return <Alert message={error} type="error" showIcon />;
   }

   if (types.length === 0) {
      return <Alert message="Không có loại xe nào" type="info" showIcon />;
   }

   return (
      <Row gutter={[16, 16]}>
         {types.map((type) => (
            <Col xs={24} sm={12} md={8} lg={6} key={type.type}>
               <VehicleTypeCard
                  data={type}
                  onClick={() => {
                     onSelectType(type.type, type.maxWeightKg, type.pricePerKm);
                  }}
               />
            </Col>
         ))}
      </Row>
   );
}


