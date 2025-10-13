import React from 'react';
import { Card, Empty, Button } from 'antd';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function OrderEmpty({ hasFilters }) {
   const navigate = useNavigate();

   return (
      <Card className="shadow-lg border-0">
         <div className="text-center py-12">
            <div className="mb-6">
               <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                  <InboxOutlined className="text-5xl text-gray-400" />
               </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">
               {hasFilters ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}
            </h3>

            <p className="text-gray-500 mb-6 max-w-md mx-auto">
               {hasFilters
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả khác'
                  : 'Bạn chưa có đơn hàng nào. Hãy đặt đơn hàng đầu tiên của bạn!'
               }
            </p>

            {!hasFilters && (
               <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/dashboard/order-create')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 border-none hover:from-blue-600 hover:to-blue-700 px-8 h-12 font-medium shadow-lg"
               >
                  Đặt đơn hàng ngay
               </Button>
            )}
         </div>
      </Card>
   );
}

