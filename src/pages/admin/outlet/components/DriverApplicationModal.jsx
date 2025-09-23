import { Avatar, Descriptions, Modal } from "antd";

export default function DriverApplicationModal({ open, onClose, viewing, loading }) {
   return (
      <Modal open={open} onCancel={onClose} footer={null} title="Chi tiết hồ sơ">
         {viewing && (
            <Descriptions loading={loading} bordered column={1} size="small">
               <Descriptions.Item label="Ảnh chân dung">
                  <Avatar src={viewing?.docs?.portraitUrl || viewing?.user?.avatarUrl} size={72} />
               </Descriptions.Item>
               <Descriptions.Item label="Application ID">{viewing?._id}</Descriptions.Item>
               <Descriptions.Item label="User ID">{viewing?.userId || viewing?.user?._id}</Descriptions.Item>
               <Descriptions.Item label="Họ tên">{viewing?.user?.name}</Descriptions.Item>
               <Descriptions.Item label="Email">{viewing?.user?.email}</Descriptions.Item>
               <Descriptions.Item label="SĐT">{viewing?.user?.phone}</Descriptions.Item>
               <Descriptions.Item label="Địa chỉ">{viewing?.user?.address}</Descriptions.Item>
               <Descriptions.Item label="Vai trò chính">{viewing?.user?.role}</Descriptions.Item>
               <Descriptions.Item label="Tất cả roles">{Array.isArray(viewing?.user?.roles) ? viewing.user.roles.join(", ") : (viewing?.user?.roles || "")}</Descriptions.Item>
               <Descriptions.Item label="Xác thực email">{viewing?.user?.isEmailVerified ? "Đã xác thực" : "Chưa"}</Descriptions.Item>
               <Descriptions.Item label="Trạng thái hồ sơ">{viewing?.status}</Descriptions.Item>
               <Descriptions.Item label="Ghi chú Admin">{viewing?.adminNote || ""}</Descriptions.Item>
               <Descriptions.Item label="Nộp lúc">{viewing?.submittedAt ? new Date(viewing.submittedAt).toLocaleString() : ""}</Descriptions.Item>
               <Descriptions.Item label="Duyệt lúc">{viewing?.reviewedAt ? new Date(viewing.reviewedAt).toLocaleString() : ""}</Descriptions.Item>
               <Descriptions.Item label="Tạo lúc">{viewing?.createdAt ? new Date(viewing.createdAt).toLocaleString() : ""}</Descriptions.Item>
               <Descriptions.Item label="Cập nhật lúc">{viewing?.updatedAt ? new Date(viewing.updatedAt).toLocaleString() : ""}</Descriptions.Item>
               {viewing?.docs && (
                  <Descriptions.Item label="Hình ảnh">
                     <div className="grid grid-cols-2 gap-2">
                        {[
                           viewing.docs.licenseFrontUrl,
                           viewing.docs.licenseBackUrl,
                           viewing.docs.idCardFrontUrl,
                           viewing.docs.idCardBackUrl,
                           viewing.docs.portraitUrl,
                           ...(viewing.docs.vehiclePhotos || []),
                           ...(viewing.docs.vehicleDocs || []),
                        ]
                           .filter(Boolean)
                           .map((url, idx) => (
                              <a key={idx} href={url} target="_blank" rel="noreferrer">
                                 <img src={url} alt="doc" className="h-24 w-full rounded object-cover" />
                              </a>
                           ))}
                     </div>
                  </Descriptions.Item>
               )}
            </Descriptions>
         )}
      </Modal>
   );
}


