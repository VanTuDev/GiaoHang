import React, { useState } from 'react';
import { Upload, Button, message, Spin, Modal } from 'antd';
import { UploadOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '../../utils/cloudinaryService';

/**
 * Component upload ảnh sử dụng Cloudinary
 * 
 * @param {Object} props
 * @param {Function} props.onChange - Callback khi danh sách file thay đổi
 * @param {Array} props.value - Danh sách URL của các file đã upload
 * @param {string} props.folder - Thư mục trên Cloudinary để lưu file
 * @param {number} props.maxCount - Số lượng file tối đa có thể upload
 * @param {boolean} props.multiple - Cho phép upload nhiều file cùng lúc
 * @param {string} props.listType - Kiểu hiển thị danh sách (text, picture, picture-card)
 */
const CloudinaryUpload = ({
   onChange,
   value = [],
   folder = 'default',
   maxCount = 5,
   multiple = true,
   listType = 'picture-card',
   ...props
}) => {
   const [fileList, setFileList] = useState([]);
   const [uploading, setUploading] = useState(false);
   const [previewVisible, setPreviewVisible] = useState(false);
   const [previewImage, setPreviewImage] = useState('');
   const [previewTitle, setPreviewTitle] = useState('');

   // Khởi tạo fileList từ value (URLs)
   React.useEffect(() => {
      if (Array.isArray(value) && value.length > 0) {
         const initialFileList = value.map((url, index) => ({
            uid: `-${index}`,
            name: `image-${index}`,
            status: 'done',
            url,
         }));
         setFileList(initialFileList);
      }
   }, []);

   // Xử lý khi danh sách file thay đổi
   const handleChange = ({ fileList: newFileList }) => {
      // Lọc các file đã upload thành công
      const successFiles = newFileList.filter(file => file.status === 'done');

      // Cập nhật fileList
      setFileList(newFileList);

      // Nếu có callback onChange, gọi với danh sách URLs
      if (onChange) {
         const urls = successFiles.map(file => file.url);
         onChange(urls);
      }
   };

   // Xử lý trước khi upload
   const beforeUpload = (file) => {
      // Kiểm tra loại file
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
         message.error('Chỉ có thể upload file hình ảnh!');
         return Upload.LIST_IGNORE;
      }

      // Kiểm tra kích thước file
      const isLessThan5M = file.size / 1024 / 1024 < 5;
      if (!isLessThan5M) {
         message.error('Kích thước hình ảnh phải nhỏ hơn 5MB!');
         return Upload.LIST_IGNORE;
      }

      return true;
   };

   // Xử lý custom upload
   const customUpload = async ({ file, onSuccess, onError, onProgress }) => {
      setUploading(true);

      try {
         // Upload file lên Cloudinary
         const result = await uploadToCloudinary(file, folder);

         // Cập nhật thông tin file
         const uploadedFile = {
            uid: file.uid,
            name: file.name,
            status: 'done',
            url: result.secure_url,
            thumbUrl: result.secure_url,
            response: result
         };

         onSuccess(result, uploadedFile);
         setUploading(false);
      } catch (error) {
         console.error('Upload error:', error);
         onError(error);
         message.error(`${file.name} upload thất bại.`);
         setUploading(false);
      }
   };

   // Xử lý xem trước hình ảnh
   const handlePreview = async (file) => {
      setPreviewImage(file.url || file.thumbUrl);
      setPreviewVisible(true);
      setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
   };

   // Upload button
   const uploadButton = (
      <div>
         <PlusOutlined />
         <div style={{ marginTop: 8 }}>Tải lên</div>
      </div>
   );

   return (
      <>
         <Upload
            listType={listType}
            fileList={fileList}
            onChange={handleChange}
            beforeUpload={beforeUpload}
            customRequest={customUpload}
            onPreview={handlePreview}
            multiple={multiple}
            maxCount={maxCount}
            {...props}
         >
            {fileList.length >= maxCount ? null : (
               listType === 'picture-card' ? uploadButton : (
                  <Button icon={<UploadOutlined />} loading={uploading}>
                     Tải lên
                  </Button>
               )
            )}
         </Upload>

         <Modal
            open={previewVisible}
            title={previewTitle}
            footer={null}
            onCancel={() => setPreviewVisible(false)}
         >
            <img alt="preview" style={{ width: '100%' }} src={previewImage} />
         </Modal>
      </>
   );
};

export default CloudinaryUpload;
