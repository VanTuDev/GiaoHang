import { Card, Statistic, Row, Col } from "antd"

const RevenuePage = () => {
   return (
      <div>
         <h2 className="text-xl font-semibold mb-4">Quản lý doanh thu hệ thống</h2>
         <Row gutter={16}>
            <Col span={6}>
               <Card>
                  <Statistic title="Doanh thu tháng" value={12000000} suffix="VNĐ" />
               </Card>
            </Col>
            <Col span={6}>
               <Card>
                  <Statistic title="Đơn thành công" value={320} />
               </Card>
            </Col>
            <Col span={6}>
               <Card>
                  <Statistic title="Đơn hủy" value={15} />
               </Card>
            </Col>
         </Row>
      </div>
   )
}

export default RevenuePage
