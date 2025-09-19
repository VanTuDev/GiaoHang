import React from "react";
import { Collapse } from "antd";

const { Panel } = Collapse;

const ReportsPage = () => {
   const reports = [
      { id: 1, title: "Khách hàng báo hỏng hàng", detail: "Đơn #12345 - Vỡ hàng khi giao" },
      { id: 2, title: "Tài xế đi trễ", detail: "Đơn #12346 - Giao muộn 30 phút" },
   ];

   return (
      <div>
         <h2 className="text-xl font-semibold mb-4">Quản lý báo cáo</h2>
         <Collapse accordion>
            {reports.map((r) => (
               <Panel header={r.title} key={r.id}>
                  <p>{r.detail}</p>
               </Panel>
            ))}
         </Collapse>
      </div>
   );
};

export default ReportsPage;
