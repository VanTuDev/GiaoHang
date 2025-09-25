/**
 * Dịch vụ upload ảnh lên Cloudinary
 * 
 * Thay vì upload trực tiếp lên Cloudinary từ frontend (cần phải để lộ API key),
 * chúng ta sẽ upload qua backend API để bảo mật hơn.
 */

import axiosClient from "../authentication/api/axiosClient";

/**
 * Upload file lên Cloudinary thông qua backend API
 * @param {File} file - File cần upload
 * @param {string} folder - Thư mục lưu trữ trên Cloudinary
 * @returns {Promise<Object>} - Kết quả upload từ Cloudinary
 */
export const uploadToCloudinary = async (file, folder = 'default') => {
   if (!file) {
      throw new Error('Không có file được cung cấp');
   }

   try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await axiosClient.post('/api/upload/image', formData, {
         headers: {
            'Content-Type': 'multipart/form-data'
         }
      });

      if (!response.data?.success) {
         throw new Error(`Lỗi upload: ${response.data?.message || 'Không xác định'}`);
      }

      return response.data.data;
   } catch (error) {
      console.error('Lỗi khi upload ảnh:', error);
      throw error;
   }
};

/**
 * Upload nhiều file lên Cloudinary
 * @param {File[]} files - Danh sách file cần upload
 * @param {string} folder - Thư mục lưu trữ trên Cloudinary
 * @returns {Promise<Object[]>} - Kết quả upload từ Cloudinary
 */
export const uploadMultipleToCloudinary = async (files, folder = 'default') => {
   if (!files || !files.length) {
      throw new Error('Không có file được cung cấp');
   }

   const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
   return Promise.all(uploadPromises);
};

export default {
   uploadToCloudinary,
   uploadMultipleToCloudinary
};