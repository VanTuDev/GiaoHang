import { useState } from "react";
import { Modal, Upload, Form, Button, message, Row, Col, Card, Divider } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { driverService } from "../../features/driver/api/driverService";

export default function DriverApplyModal({ open, onClose, onSuccess }) {
   const [submitting, setSubmitting] = useState(false);
   const [files, setFiles] = useState({});
   const [previews, setPreviews] = useState({
      licenseFront: null,
      licenseBack: null,
      idFront: null,
      idBack: null,
      portrait: null,
      vehiclePhotos: [],
      vehicleDocs: []
   });

   const setFile = (key) => ({ file, onSuccess }) => {
      setFiles((prev) => ({ ...prev, [key]: file }));
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [key]: url }));
      onSuccess?.("ok");
   };

   const setFileListPush = (key) => ({ file, onSuccess }) => {
      setFiles((prev) => ({ ...prev, [key]: [...(prev[key] || []), file] }));
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [key]: [...(prev[key] || []), url] }));
      onSuccess?.("ok");
   };

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

   const DraggerOne = ({ label, onChange, previewUrl }) => (
      <div>
         <div className="mb-1 text-sm font-medium">{label}</div>
         <Upload.Dragger
            accept="image/*"
            multiple={false}
            showUploadList={false}
            customRequest={onChange}
         >
            <p className="ant-upload-drag-icon">
               <InboxOutlined />
            </p>
            <p className="ant-upload-text">Kéo thả hoặc bấm để chọn ảnh</p>
            <p className="ant-upload-hint">PNG, JPG, JPEG • Tối ưu dung lượng & rõ nét</p>
         </Upload.Dragger>
         {previewUrl ? (
            <div className="mt-2">
               <img src={previewUrl} alt="preview" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8 }} />
            </div>
         ) : null}
      </div>
   );

   const DraggerMulti = ({ label, onChange, previewUrls = [] }) => (
      <div>
         <div className="mb-1 text-sm font-medium">{label}</div>
         <Upload.Dragger
            accept="image/*"
            multiple
            showUploadList={false}
            customRequest={onChange}
         >
            <p className="ant-upload-drag-icon">
               <InboxOutlined />
            </p>
            <p className="ant-upload-text">Kéo thả nhiều ảnh/file hoặc bấm để chọn</p>
            <p className="ant-upload-hint">Có thể chọn nhiều ảnh một lần</p>
         </Upload.Dragger>
         {previewUrls.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 mt-2">
               {previewUrls.map((u, idx) => (
                  <img key={idx} src={u} alt={`preview-${idx}`} style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8 }} />
               ))}
            </div>
         ) : null}
      </div>
   );

   return (
      <Modal
         open={open}
         onCancel={onClose}
         onOk={handleSubmit}
         confirmLoading={submitting}
         okText="Nộp hồ sơ"
         title="Nộp hồ sơ tài xế"
         width={900}
         centered
         maskClosable={false}
         styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 } }}
      >
         <div className="space-y-4">
            <Card bordered className="shadow-sm">
               <div className="font-semibold mb-2">Giấy tờ cá nhân</div>
               <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                     <DraggerOne label="Bằng lái - mặt trước" onChange={setFile("licenseFront")} previewUrl={previews.licenseFront} />
                  </Col>
                  <Col xs={24} md={12}>
                     <DraggerOne label="Bằng lái - mặt sau" onChange={setFile("licenseBack")} previewUrl={previews.licenseBack} />
                  </Col>
                  <Col xs={24} md={12}>
                     <DraggerOne label="CCCD - mặt trước" onChange={setFile("idFront")} previewUrl={previews.idFront} />
                  </Col>
                  <Col xs={24} md={12}>
                     <DraggerOne label="CCCD - mặt sau" onChange={setFile("idBack")} previewUrl={previews.idBack} />
                  </Col>
                  <Col xs={24} md={12}>
                     <DraggerOne label="Ảnh chân dung" onChange={setFile("portrait")} previewUrl={previews.portrait} />
                  </Col>
               </Row>
            </Card>

            <Card bordered className="shadow-sm">
               <div className="font-semibold mb-2">Giấy tờ & hình ảnh xe</div>
               <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                     <DraggerMulti label="Ảnh xe (nhiều)" onChange={setFileListPush("vehiclePhotos")} previewUrls={previews.vehiclePhotos} />
                  </Col>
                  <Col xs={24} md={12}>
                     <DraggerMulti label="Giấy tờ xe (nhiều)" onChange={setFileListPush("vehicleDocs")} previewUrls={previews.vehicleDocs} />
                  </Col>
               </Row>
            </Card>

            <Divider className="my-2" />
            <div className="text-sm text-gray-500">Vui lòng đảm bảo hình ảnh rõ nét, không bị che mờ thông tin. Các tệp sẽ được tải lên khi bạn bấm "Nộp hồ sơ".</div>
         </div>
      </Modal>
   );
}


