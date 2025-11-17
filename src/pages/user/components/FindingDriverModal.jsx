import React from 'react';
import { Modal, Spin } from 'antd';
import { SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';

const FindingDriverModal = ({ 
   visible, 
   orderId,
   driverFound = false,
   driverName = null 
}) => {
   return (
      <Modal
         open={visible}
         closable={false}
         footer={null}
         centered
         width={400}
         maskClosable={false}
         className="finding-driver-modal"
         zIndex={2000}
         maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
         <div className="text-center py-6">
            {!driverFound ? (
               <>
                  {/* Loading State */}
                  <div className="mb-6">
                     <Spin size="large" />
                  </div>
                  <div className="flex justify-center mb-4">
                     <SearchOutlined 
                        className="text-6xl text-blue-500 animate-pulse" 
                        style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                     />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">
                     Đang tìm tài xế
                  </h3>
                  <p className="text-gray-600 mb-2">
                     Hệ thống đang quét các tài xế gần bạn
                  </p>
                  <p className="text-sm text-gray-500">
                     Vui lòng đợi trong giây lát...
                  </p>
                  
                  {/* Loading dots animation */}
                  <div className="flex justify-center space-x-2 mt-4">
                     <div 
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0s' }}
                     />
                     <div 
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                     />
                     <div 
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.4s' }}
                     />
                  </div>
               </>
            ) : (
               <>
                  {/* Success State */}
                  <div className="mb-6">
                     <CheckCircleOutlined 
                        className="text-6xl text-green-500"
                        style={{ 
                           animation: 'scaleIn 0.5s ease-out',
                        }}
                     />
                  </div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">
                     Đã tìm thấy tài xế!
                  </h3>
                  {driverName && (
                     <p className="text-lg font-semibold text-gray-700 mb-2">
                        {driverName}
                     </p>
                  )}
                  <p className="text-gray-600">
                     Đang chuyển đến trang đơn hàng...
                  </p>
               </>
            )}
         </div>
         
         <style jsx>{`
            @keyframes scaleIn {
               from {
                  transform: scale(0);
                  opacity: 0;
               }
               to {
                  transform: scale(1);
                  opacity: 1;
               }
            }
         `}</style>
      </Modal>
   );
};

export default FindingDriverModal;

