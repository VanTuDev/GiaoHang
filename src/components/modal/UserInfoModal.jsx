import { useEffect, useState } from "react";
import {
   Modal,
   Avatar,
   Descriptions,
   Spin,
   Form,
   Input,
   Button,
   Upload,
   message,
   Card,
   Tooltip,
} from "antd";
import {
   UserOutlined,
   MailOutlined,
   PhoneOutlined,
   HomeOutlined,
   SafetyCertificateOutlined,
   CameraOutlined,
   SaveOutlined,
} from "@ant-design/icons";
import { profileService } from "../../features/profile/api/profileService";

export default function UserInfoModal({ open, onClose, user }) {
   const [loading, setLoading] = useState(false);
   const [saving, setSaving] = useState(false);
   const [profile, setProfile] = useState(null);
   const [uploading, setUploading] = useState(false);
   const [form] = Form.useForm();

   useEffect(() => {
      if (!open) return;
      let mounted = true;
      (async () => {
         setLoading(true);
         try {
            const res = await profileService.me();
            if (mounted) {
               const data = res.data?.data || null;
               setProfile(data);
               form.setFieldsValue({ name: data?.name, address: data?.address });
            }
         } catch (e) {
            console.error(e);
         } finally {
            if (mounted) setLoading(false);
         }
      })();
      return () => {
         mounted = false;
      };
   }, [open]);

   const p = profile || user || {};

   const onSave = async () => {
      try {
         setSaving(true);
         const values = await form.validateFields();
         await profileService.updateMe(values);
         message.success("Đã lưu thông tin");
         const refreshed = await profileService.me();
         setProfile(refreshed.data?.data || null);
      } catch (e) {
         if (e?.errorFields) return; // validation error
         message.error("Lưu thất bại");
      } finally {
         setSaving(false);
      }
   };

   return (
      <Modal
         open={open}
         onCancel={onClose}
         footer={null}
         centered
         width={720}
         title={
            <div className="flex items-center gap-2 text-green-700 font-semibold">
               <UserOutlined />
               Thông tin tài khoản
            </div>
         }
      >
         <Spin spinning={loading}>
            <div className="grid md:grid-cols-2 gap-6">
               {/* Avatar + Form */}
               <Card title="Chỉnh sửa thông tin" bordered className="shadow-sm">
                  <div className="flex flex-col items-center mb-4">
                     <Upload
                        accept="image/*"
                        showUploadList={false}
                        disabled={loading || uploading}
                        customRequest={({ file, onSuccess }) => {
                           setUploading(true);
                           profileService
                              .uploadAvatar(file)
                              .then(() => profileService.me())
                              .then((refresh) => setProfile(refresh.data?.data || null))
                              .catch(() => message.error("Upload thất bại"))
                              .finally(() => {
                                 setUploading(false);
                                 onSuccess?.("ok");
                              });
                        }}
                     >
                        <Tooltip title="Đổi ảnh đại diện">
                           <div className="relative cursor-pointer group">
                              <Avatar
                                 size={96}
                                 src={p?.avatarUrl}
                                 icon={<UserOutlined />}
                                 className="bg-green-700"
                              />
                              <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/40 rounded-full text-white">
                                 <CameraOutlined />
                              </div>
                           </div>
                        </Tooltip>
                     </Upload>
                     <div className="mt-2 text-lg font-medium">{p?.name}</div>
                     <div className="text-gray-500 text-sm">{p?.email}</div>
                  </div>

                  <Form layout="vertical" form={form}>
                     <Form.Item
                        name="name"
                        label="Họ tên"
                        rules={[{ required: true, message: "Nhập họ tên" }]}
                     >
                        <Input prefix={<UserOutlined />} />
                     </Form.Item>
                     <Form.Item name="address" label="Địa chỉ">
                        <Input prefix={<HomeOutlined />} />
                     </Form.Item>
                     <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        className="!bg-green-700 w-full"
                        loading={saving}
                        onClick={onSave}
                     >
                        Lưu thông tin
                     </Button>
                  </Form>
               </Card>

               {/* Thông tin chi tiết */}
               <Card title="Chi tiết tài khoản" bordered className="shadow-sm">
                  <Descriptions bordered column={1} size="small">
                     <Descriptions.Item label={<MailOutlined />}>
                        {p?.email || "Chưa có"}
                     </Descriptions.Item>
                     <Descriptions.Item label={<PhoneOutlined />}>
                        {p?.phone || "Chưa có"}
                     </Descriptions.Item>
                     <Descriptions.Item label="Vai trò">
                        {p?.role || "null"}
                     </Descriptions.Item>
                     <Descriptions.Item label={<SafetyCertificateOutlined />}>
                        {p?.isEmailVerified ? "Đã xác thực" : "Chưa"}
                     </Descriptions.Item>
                  </Descriptions>
               </Card>
            </div>
         </Spin>
      </Modal>
   );
}
