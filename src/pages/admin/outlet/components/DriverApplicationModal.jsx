import { Avatar, Descriptions, Modal, Row, Col, Card, Tag } from "antd";

export default function DriverApplicationModal({ open, onClose, viewing, loading }) {
   const docs = viewing?.docs || {};
   const images = [
      docs.licenseFrontUrl,
      docs.licenseBackUrl,
      docs.idCardFrontUrl,
      docs.idCardBackUrl,
      docs.portraitUrl,
      ...(docs.vehiclePhotos || []),
      ...(docs.vehicleDocs || []),
   ].filter(Boolean);

   return (
      <Modal
         open={open}
         onCancel={onClose}
         footer={null}
         title="Chi tiết hồ sơ"
         width={960}
         centered
         maskClosable={false}
         styles={{ body: { maxHeight: '75vh', overflowY: 'auto', paddingRight: 8 } }}
      >
         {viewing && (
            <div className="space-y-4">
               {/* Header ngang */}
               <Card className="shadow-sm">
                  <Row gutter={[16, 16]} align="middle">
                     <Col xs={24} md={6}>
                        <div className="flex items-center space-x-3">
                           <Avatar src={docs.portraitUrl || viewing?.user?.avatarUrl} size={80} />
                           <div>
                              <div className="text-lg font-semibold">{viewing?.user?.name || "Ứng viên"}</div>
                           </div>
                        </div>
                     </Col>
                     <Col xs={24} md={6}>
                        <div>
                           <div className="text-xs text-gray-500">Email</div>
                           <div>{viewing?.user?.email || 'N/A'}</div>
                        </div>
                     </Col>
                     <Col xs={24} md={6}>
                        <div>
                           <div className="text-xs text-gray-500">Số điện thoại</div>
                           <div>{viewing?.user?.phone || 'N/A'}</div>
                        </div>
                     </Col>
                     <Col xs={24} md={6}>
                        <div className="flex items-center space-x-8">
                           <div>
                              <div className="text-xs text-gray-500">Trạng thái</div>
                              <Tag color={viewing?.status === 'Approved' ? 'green' : viewing?.status === 'Rejected' ? 'red' : 'orange'}>
                                 {viewing?.status || 'Pending'}
                              </Tag>
                           </div>
                        </div>
                     </Col>
                  </Row>
               </Card>

               {/* Thông tin chi tiết 2 cột */}
               <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                     <Card title="Thông tin người dùng" className="shadow-sm" bordered>
                        <Descriptions loading={loading} bordered column={1} size="small">
                           <Descriptions.Item label="User ID">{viewing?.userId || viewing?.user?._id}</Descriptions.Item>
                           <Descriptions.Item label="Vai trò chính">{viewing?.user?.role || 'N/A'}</Descriptions.Item>
                           <Descriptions.Item label="Tất cả roles">{Array.isArray(viewing?.user?.roles) ? viewing.user.roles.join(", ") : (viewing?.user?.roles || "")}</Descriptions.Item>
                           <Descriptions.Item label="Xác thực email">{viewing?.user?.isEmailVerified ? "Đã xác thực" : "Chưa"}</Descriptions.Item>
                           <Descriptions.Item label="Địa chỉ">{viewing?.user?.address || 'N/A'}</Descriptions.Item>
                           <Descriptions.Item label="Email">{viewing?.user?.email || 'N/A'}</Descriptions.Item>
                           <Descriptions.Item label="Số điện thoại">{viewing?.user?.phone || 'N/A'}</Descriptions.Item>
                        </Descriptions>
                     </Card>
                  </Col>
                  <Col xs={24} md={12}>
                     <Card title="Trạng thái hồ sơ" className="shadow-sm" bordered>
                        <Descriptions bordered column={1} size="small">
                           <Descriptions.Item label="Trạng thái">{viewing?.status}</Descriptions.Item>
                           <Descriptions.Item label="Ghi chú Admin">{viewing?.adminNote || ""}</Descriptions.Item>
                           <Descriptions.Item label="Nộp lúc">{viewing?.submittedAt ? new Date(viewing.submittedAt).toLocaleString() : ""}</Descriptions.Item>
                           <Descriptions.Item label="Duyệt lúc">{viewing?.reviewedAt ? new Date(viewing.reviewedAt).toLocaleString() : ""}</Descriptions.Item>
                           <Descriptions.Item label="Tạo lúc">{viewing?.createdAt ? new Date(viewing.createdAt).toLocaleString() : ""}</Descriptions.Item>
                           <Descriptions.Item label="Cập nhật lúc">{viewing?.updatedAt ? new Date(viewing.updatedAt).toLocaleString() : ""}</Descriptions.Item>
                           {viewing?.driver && (
                              <Descriptions.Item label="Driver status">{viewing.driver.status}</Descriptions.Item>
                           )}
                        </Descriptions>
                     </Card>
                  </Col>
               </Row>

               {/* Hình ảnh giấy tờ */}
               {images.length > 0 && (
                  <Card title="Hình ảnh giấy tờ" className="shadow-sm" bordered>
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {images.map((url, idx) => (
                           <a key={idx} href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt="doc" className="h-28 w-full rounded object-cover" />
                           </a>
                        ))}
                     </div>
                  </Card>
               )}

               {/* Xe của tài xế */}
               {Array.isArray(viewing?.vehicles) && viewing.vehicles.length > 0 && (
                  <Card title="Xe của tài xế" className="shadow-sm" bordered>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {viewing.vehicles.map((v) => (
                           <div key={v._id} className="flex items-center gap-12">
                              <img src={v.photoUrl} alt={v.type} className="w-28 h-20 object-cover rounded" />
                              <div>
                                 <div className="font-medium">{v.type} - {v.licensePlate}</div>
                                 <div className="text-sm text-gray-500">Tải trọng: {v.maxWeightKg}kg</div>
                                 <Tag color={v.status === 'Active' ? 'green' : 'default'}>{v.status || 'N/A'}</Tag>
                              </div>
                           </div>
                        ))}
                     </div>
                  </Card>
               )}

               {/* Thống kê */}
               {(viewing?.stats?.orders || viewing?.stats?.driver) && (
                  <Card title="Thống kê" className="shadow-sm" bordered>
                     <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Đơn hàng (customer)">
                           <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(viewing.stats.orders || {}, null, 2)}</pre>
                        </Descriptions.Item>
                        {viewing.stats.driver ? (
                           <Descriptions.Item label="Mục đơn (driver)">
                              <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(viewing.stats.driver || {}, null, 2)}</pre>
                           </Descriptions.Item>
                        ) : null}
                     </Descriptions>
                  </Card>
               )}
            </div>
         )}
      </Modal>
   );
}


