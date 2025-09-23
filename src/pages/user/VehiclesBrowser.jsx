import React, { useEffect, useMemo, useState } from "react";
import { Col, Input, Row, Select } from "antd";
import { vehicleService } from "../../features/vehicles/api/vehicleService";
import { useNavigate } from "react-router-dom";
import VehicleTypeCard from "./components/VehicleTypeCard";

export default function VehiclesBrowser() {
   const [loading, setLoading] = useState(false);
   const [types, setTypes] = useState([]);
   const [type, setType] = useState(undefined);
   const [weightKg, setWeightKg] = useState(undefined);

   useEffect(() => {
      (async () => {
         setLoading(true);
         try {
            const res = await vehicleService.getTypes();
            setTypes(res.data?.data || []);
         } finally {
            setLoading(false);
         }
      })();
   }, []);

   const filtered = useMemo(() => {
      return (types || []).filter((t) => {
         const typeOk = type ? t.type === type : true;
         const weightOk = weightKg ? (t.maxWeightKg || 0) >= Number(weightKg) : true;
         return typeOk && weightOk;
      });
   }, [types, type, weightKg]);

   const navigate = useNavigate();

   return (
      <div>
         <div className="mb-4 flex items-center gap-2">
            <Select
               allowClear
               placeholder="Loại phương tiện"
               value={type}
               onChange={setType}
               loading={loading}
               options={[...new Set(types.map((t) => t.type))].map((i) => ({ value: i, label: i }))}
               style={{ width: 220 }}
            />
            <Input
               placeholder="Khối lượng (kg)"
               type="number"
               value={weightKg}
               onChange={(e) => setWeightKg(e.target.value)}
               style={{ width: 180 }}
            />
         </div>
         <Row gutter={[16, 16]}>
            {filtered.map((v) => (
               <Col xs={24} sm={12} md={8} lg={6} key={v._id || v.type}>
                  <VehicleTypeCard
                     data={{ type: v.type, label: v.label || v.name || v.type, maxWeightKg: v.maxWeightKg, sampleImage: v.sampleImage || v.imageUrl }}
                     onClick={() => navigate(`/dashboard/book?type=${encodeURIComponent(v.type)}`)}
                  />
               </Col>
            ))}
         </Row>
      </div>
   );
}


