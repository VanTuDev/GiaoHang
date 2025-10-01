import React, { useEffect, useMemo, useState } from "react";
import { Col, Input, Row, Select, Spin, Empty, Alert } from "antd";
import { vehicleService } from "../../features/vehicles/api/vehicleService";
import { useNavigate } from "react-router-dom";
import VehicleTypeCard from "./components/VehicleTypeCard";

export default function VehiclesBrowser() {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [types, setTypes] = useState([]);
   const [type, setType] = useState(undefined);
   const [weightKg, setWeightKg] = useState(undefined);

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

   const filtered = useMemo(() => {
      return (types || []).filter((t) => {
         const typeOk = type ? t.type === type : true;
         const weightOk = weightKg ? (t.maxWeightKg || 0) >= Number(weightKg) : true;
         return typeOk && weightOk;
      });
   }, [types, type, weightKg]);

   const navigate = useNavigate();

   // Tạo danh sách các loại xe duy nhất cho dropdown
   const typeOptions = useMemo(() => {
      const uniqueTypes = [...new Set(types.map((t) => t.type))];
      return uniqueTypes.map((type) => {
         // Tìm label tương ứng với type
         const typeInfo = types.find((t) => t.type === type);
         return {
            value: type,
            label: typeInfo?.label || type
         };
      });
   }, [types]);

   return (
      <div>
         <h2 className="text-2xl font-bold mb-4">Danh sách loại xe</h2>

         {error && (
            <Alert
               message="Lỗi"
               description={error}
               type="error"
               showIcon
               className="mb-4"
            />
         )}

         <div className="mb-6 flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
            <Select
               allowClear
               placeholder="Loại phương tiện"
               value={type}
               onChange={setType}
               loading={loading}
               options={typeOptions}
               style={{ width: 220 }}
               className="flex-shrink-0"
            />
            <Input
               placeholder="Khối lượng tối thiểu (kg)"
               type="number"
               value={weightKg}
               onChange={(e) => setWeightKg(e.target.value)}
               style={{ width: 220 }}
               className="flex-shrink-0"
            />
            <div className="text-sm text-gray-500 ml-2">
               {filtered.length} loại xe phù hợp
            </div>
         </div>

         {loading ? (
            <div className="flex justify-center py-10">
               <Spin size="large" tip="Đang tải danh sách xe..." />
            </div>
         ) : filtered.length > 0 ? (
            <Row gutter={[16, 16]}>
               {filtered.map((v) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={v.type}>
                     <VehicleTypeCard
                        data={{
                           type: v.type,
                           label: v.label || v.type,
                           maxWeightKg: v.maxWeightKg,
                           sampleImage: v.sampleImage,
                           pricePerKm: v.pricePerKm
                        }}
                        onClick={() => navigate(`/dashboard/book?type=${encodeURIComponent(v.type)}&weight=${v.maxWeightKg}`)}
                     />
                  </Col>
               ))}
            </Row>
         ) : (
            <Empty
               description="Không tìm thấy loại xe phù hợp"
               className="py-10"
            />
         )}
      </div>
   );
}