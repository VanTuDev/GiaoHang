import { useState } from "react";
import { Modal, Upload, Form, Button, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { driverService } from "../../features/driver/api/driverService";

export default function DriverApplyModal({ open, onClose, onSuccess }) {
   const [submitting, setSubmitting] = useState(false);
   const [files, setFiles] = useState({});

   const setFile = (key) => ({ file }) => setFiles((prev) => ({ ...prev, [key]: file }));
   const setFileListPush = (key) => ({ file }) =>
      setFiles((prev) => ({ ...prev, [key]: [...(prev[key] || []), file] }));

   const handleSubmit = async () => {
      try {
         setSubmitting(true);
         const form = new FormData();
         if (files.licenseFront) form.append("licenseFront", files.licenseFront);
         if (files.licenseBack) form.append("licenseBack", files.licenseBack);
         if (files.idFront) form.append("idFront", files.idFront);
         if (files.idBack) form.append("idBack", files.idBack);
         if (files.portrait) form.append("portrait", files.portrait);
         (files.vehiclePhotos || []).forEach((f) => form.append("vehiclePhotos", f));
         (files.vehicleDocs || []).forEach((f) => form.append("vehicleDocs", f));
         await driverService.apply(form);
         message.success("Đã nộp hồ sơ tài xế");
         onSuccess?.();
         onClose?.();
      } catch (e) {
         message.error("Nộp hồ sơ thất bại");
      } finally {
         setSubmitting(false);
      }
   };

   const DraggerOne = ({ label, onChange }) => (
      <div>
         <div className="mb-1 text-sm font-medium">{label}</div>
         <Upload.Dragger accept="image/*" multiple={false} showUploadList={true} customRequest={onChange}>
            <p className="ant-upload-drag-icon">
               <InboxOutlined />
            </p>
            <p className="ant-upload-text">Kéo thả hoặc bấm để chọn ảnh</p>
         </Upload.Dragger>
      </div>
   );

   const DraggerMulti = ({ label, onChange }) => (
      <div>
         <div className="mb-1 text-sm font-medium">{label}</div>
         <Upload.Dragger accept="image/*" multiple showUploadList customRequest={onChange}>
            <p className="ant-upload-drag-icon">
               <InboxOutlined />
            </p>
            <p className="ant-upload-text">Kéo thả nhiều ảnh/file hoặc bấm để chọn</p>
         </Upload.Dragger>
      </div>
   );

   return (
      <Modal open={open} onCancel={onClose} onOk={handleSubmit} confirmLoading={submitting} okText="Nộp hồ sơ" title="Nộp hồ sơ tài xế">
         <div className="space-y-4">
            <DraggerOne label="Bằng lái - mặt trước" onChange={setFile("licenseFront")} />
            <DraggerOne label="Bằng lái - mặt sau" onChange={setFile("licenseBack")} />
            <DraggerOne label="CCCD - mặt trước" onChange={setFile("idFront")} />
            <DraggerOne label="CCCD - mặt sau" onChange={setFile("idBack")} />
            <DraggerOne label="Ảnh chân dung" onChange={setFile("portrait")} />
            <DraggerMulti label="Ảnh xe (nhiều)" onChange={setFileListPush("vehiclePhotos")} />
            <DraggerMulti label="Giấy tờ xe (nhiều)" onChange={setFileListPush("vehicleDocs")} />
         </div>
      </Modal>
   );
}


