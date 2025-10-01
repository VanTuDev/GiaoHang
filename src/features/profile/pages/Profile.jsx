import { useEffect, useState } from "react";
import { Tabs, Form, Input, Button, Upload, message, Select } from "antd";
import { profileService } from "../api/profileService";

export default function ProfilePage() {
   const [me, setMe] = useState(null);
   const [driver, setDriver] = useState(null);
   const [loading, setLoading] = useState(false);
   const [form] = Form.useForm();
   const [driverForm] = Form.useForm();
   const [vehicleForm] = Form.useForm();

   const fetchAll = async () => {
      setLoading(true);
      try {
         const [u, d] = await Promise.all([profileService.me(), profileService.driverMe()]);
         console.log("[GET profile]", u.data, d.data);
         setMe(u.data?.data || null);
         setDriver(d.data?.data || null);
         form.setFieldsValue({ name: u.data?.data?.name, address: u.data?.data?.address });
         driverForm.setFieldsValue({ status: d.data?.data?.status });
      } catch (e) {
         console.error(e);
         message.error("Không thể tải hồ sơ");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchAll();
   }, []);

   const onSaveProfile = async () => {
      try {
         const values = await form.validateFields();
         const res = await profileService.updateMe(values);
         console.log("[PUT /profile/me]", res.data);
         message.success("Đã lưu");
         fetchAll();
      } catch (e) {
         if (e?.errorFields) return;
         console.error(e);
         message.error("Lưu thất bại");
      }
   };

   const onUploadAvatar = async ({ file }) => {
      try {
         await profileService.uploadAvatar(file);
         message.success("Đã cập nhật ảnh đại diện");
         fetchAll();
      } catch (e) {
         console.error("Lỗi khi upload avatar:", e);
         message.error("Upload thất bại");
      }
   };

   const onSaveDriver = async () => {
      try {
         const values = await driverForm.validateFields();
         const res = await profileService.updateDriverMe(values);
         console.log("[PUT /profile/driver/me]", res.data);
         message.success("Đã lưu hồ sơ tài xế");
         fetchAll();
      } catch (e) {
         if (e?.errorFields) return;
         console.error(e);
         message.error("Lưu thất bại");
      }
   };

   const onUploadDriverAvatar = async ({ file }) => {
      try {
         await profileService.uploadDriverAvatar(file);
         message.success("Đã cập nhật ảnh tài xế");
         fetchAll();
      } catch (e) {
         console.error("Lỗi khi upload ảnh tài xế:", e);
         message.error("Upload thất bại");
      }
   };

   const onSaveVehicle = async () => {
      try {
         const values = await vehicleForm.validateFields();
         const res = await profileService.upsertVehicle(values);
         console.log("[PUT /profile/vehicle/me]", res.data);
         message.success("Đã lưu phương tiện");
         fetchAll();
      } catch (e) {
         if (e?.errorFields) return;
         console.error(e);
         message.error("Lưu thất bại");
      }
   };

   return (
      <div className="space-y-4">
         <h2 className="text-xl font-semibold text-green-700">Hồ sơ cá nhân</h2>

         <Tabs
            defaultActiveKey="user"
            items={[
               {
                  key: "user",
                  label: "User",
                  children: (
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <Form layout="vertical" form={form}>
                              <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: "Nhập họ tên" }]}>
                                 <Input />
                              </Form.Item>
                              <Form.Item name="address" label="Địa chỉ">
                                 <Input />
                              </Form.Item>
                              <Button type="primary" className="!bg-green-700" onClick={onSaveProfile}>
                                 Lưu
                              </Button>
                           </Form>
                        </div>
                        <div className="space-y-2">
                           <div className="text-sm text-gray-500">Ảnh đại diện</div>
                           <Upload
                              showUploadList={false}
                              maxCount={1}
                              customRequest={({ file, onSuccess }) => {
                                 onUploadAvatar({ file });
                                 onSuccess?.("ok");
                              }}
                           >
                              <Button>Tải ảnh lên</Button>
                           </Upload>
                        </div>
                     </div>
                  ),
               },
               {
                  key: "driver",
                  label: "Driver",
                  children: (
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <Form layout="vertical" form={driverForm}>
                              <Form.Item
                                 name="status"
                                 label="Trạng thái"
                                 rules={[{ required: true, message: "Chọn trạng thái" }]}
                              >
                                 <Select
                                    options={[
                                       { value: "Pending", label: "Pending" },
                                       { value: "Active", label: "Active" },
                                       { value: "Rejected", label: "Rejected" },
                                       { value: "Blocked", label: "Blocked" },
                                    ]}
                                 />
                              </Form.Item>
                              <Button type="primary" className="!bg-green-700" onClick={onSaveDriver}>
                                 Lưu
                              </Button>
                           </Form>
                        </div>
                        <div className="space-y-2">
                           <div className="text-sm text-gray-500">Ảnh tài xế</div>
                           <Upload
                              showUploadList={false}
                              maxCount={1}
                              customRequest={({ file, onSuccess }) => {
                                 onUploadDriverAvatar({ file });
                                 onSuccess?.("ok");
                              }}
                           >
                              <Button>Tải ảnh lên</Button>
                           </Upload>
                        </div>
                     </div>
                  ),
               },
               {
                  key: "vehicle",
                  label: "Vehicle",
                  children: (
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <Form layout="vertical" form={vehicleForm}>
                              <Form.Item
                                 name="type"
                                 label="Loại xe"
                                 rules={[{ required: true, message: "Chọn loại xe" }]}
                              >
                                 <Select
                                    options={[
                                       { value: "Motorbike", label: "Motorbike" },
                                       { value: "Pickup", label: "Pickup" },
                                       { value: "Truck", label: "Truck" },
                                    ]}
                                 />
                              </Form.Item>
                              <Form.Item name="licensePlate" label="Biển số" rules={[{ required: true, message: "Nhập biển số" }]}>
                                 <Input />
                              </Form.Item>
                              <Button type="primary" className="!bg-green-700" onClick={onSaveVehicle}>
                                 Lưu
                              </Button>
                           </Form>
                        </div>
                        <div className="space-y-2">
                           <div className="text-sm text-gray-500">Ảnh xe</div>
                           <Upload
                              showUploadList={false}
                              maxCount={1}
                              customRequest={({ file, onSuccess }) => {
                                 profileService.uploadVehiclePhoto(file).then(() => {
                                    message.success("Đã cập nhật ảnh xe");
                                    fetchAll();
                                 }).catch((e) => {
                                    console.error(e);
                                    message.error("Upload thất bại");
                                 });
                                 onSuccess?.("ok");
                              }}
                           >
                              <Button>Tải ảnh lên</Button>
                           </Upload>
                        </div>
                     </div>
                  ),
               },
            ]}
         />
      </div>
   );
}
