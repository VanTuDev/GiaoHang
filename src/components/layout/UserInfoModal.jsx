import { Modal, Avatar } from "antd";

export default function UserInfoModal({ open, onClose, user }) {
   return (
      <Modal
         open={open}
         onCancel={onClose}
         footer={null}
         centered
         title="Thông tin tài khoản"
      >
         <div className="flex items-center gap-4">
            <Avatar size={64} src={user?.avatarUrl} className="bg-green-700">
               {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <div>
               <div className="font-semibold text-green-700">{user?.name}</div>
               <div className="text-gray-600 text-sm">{user?.email}</div>
               <div className="text-gray-600 text-sm">{user?.phone}</div>
               <div className="text-gray-600 text-sm">{user?.address}</div>
            </div>
         </div>
      </Modal>
   );
}


