import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
   Alert,
   Button,
   Empty,
   Input,
   message,
   Select,
   Spin,
   Tag
} from 'antd';
import { ReloadOutlined, SendOutlined } from '@ant-design/icons';
import { orderService } from '../../features/orders/api/orderService';
import { chatService } from '../../features/chat/api/chatService';

const { TextArea } = Input;

const formatTime = (value) => {
   if (!value) return '';
   try {
      return new Intl.DateTimeFormat('vi-VN', {
         hour: '2-digit',
         minute: '2-digit',
         day: '2-digit',
         month: '2-digit'
      }).format(new Date(value));
   } catch {
      return '';
   }
};

const mergeMessages = (current, incoming) => {
   if (!incoming?.length) return current;
   const map = new Map(current.map(msg => [msg._id, msg]));
   incoming.forEach(msg => {
      map.set(msg._id, msg);
   });
   return Array.from(map.values()).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
   );
};

export default function DriverChat() {
   const [orders, setOrders] = useState([]);
   const [ordersLoading, setOrdersLoading] = useState(false);
   const [ordersError, setOrdersError] = useState(null);
   const [selectedOrderId, setSelectedOrderId] = useState(null);
   const [selectedItemId, setSelectedItemId] = useState(null);
   const [meta, setMeta] = useState(null);
   const [metaLoading, setMetaLoading] = useState(false);
   const [historyLoading, setHistoryLoading] = useState(false);
   const [messages, setMessages] = useState([]);
   const [inputValue, setInputValue] = useState('');
   const [sending, setSending] = useState(false);
   const pollAbortRef = useRef(null);
   const lastTimestampRef = useRef(null);
   const scrollAnchorRef = useRef(null);

   const driverItemOptions = useMemo(() => {
      if (!meta?.driverOptions?.length) return [];
      if (meta.participantRole === 'Driver' && meta.driverProfile?._id) {
         return meta.driverOptions.filter(
            option => String(option.driverId) === String(meta.driverProfile._id)
         );
      }
      return meta.driverOptions;
   }, [meta]);

   const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError(null);
      try {
         const response = await orderService.getDriverOrders({
            status: 'Accepted,PickedUp,Delivering,Delivered'
         });
         if (response.data?.success) {
            const data = response.data.data || [];
            const withDriver = data.filter(order =>
               Array.isArray(order.items) && order.items.some(item => item.driverId)
            );

            if (!withDriver.length) {
               setSelectedOrderId(null);
            } else if (!withDriver.some(order => String(order._id) === String(selectedOrderId))) {
               setSelectedOrderId(withDriver[0]._id);
            }

            setOrders(withDriver);
         } else {
            setOrdersError('Không thể tải đơn hàng');
         }
      } catch (error) {
         console.error('Không thể tải đơn hàng tài xế:', error);
         setOrdersError(error.response?.data?.message || error.message);
      } finally {
         setOrdersLoading(false);
      }
   };

   useEffect(() => {
      fetchOrders();
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
      lastTimestampRef.current = null;
      setMessages([]);
      setSelectedItemId(null);
   }, [selectedOrderId]);

   useEffect(() => {
      if (!selectedOrderId) {
         setMeta(null);
         return;
      }

      let ignore = false;
      const loadMeta = async () => {
         setMetaLoading(true);
         try {
            const response = await chatService.getMeta(selectedOrderId);
            if (!ignore && response.data?.success) {
               setMeta(response.data.data);
            }
         } catch (error) {
            if (!ignore) {
               console.error('Không thể tải thông tin chat:', error);
               message.error(error.response?.data?.message || 'Không thể tải thông tin chat');
            }
         } finally {
            if (!ignore) {
               setMetaLoading(false);
            }
         }
      };

      loadMeta();
      return () => { ignore = true; };
   }, [selectedOrderId]);

   useEffect(() => {
      if (!meta) return;
      if (!selectedItemId && meta.activeItemId) {
         setSelectedItemId(meta.activeItemId);
      } else if (!selectedItemId && driverItemOptions.length) {
         setSelectedItemId(driverItemOptions[0].orderItemId);
      }
   }, [meta, driverItemOptions, selectedItemId]);

   useEffect(() => {
      if (!selectedOrderId || !selectedItemId) return;
      let ignore = false;

      const loadHistory = async () => {
         setHistoryLoading(true);
         try {
            const response = await chatService.getHistory(selectedOrderId, {
               orderItemId: selectedItemId,
               limit: 100
            });
            if (!ignore && response.data?.success) {
               const history = response.data.data || [];
               setMessages(history);
               lastTimestampRef.current = history.length
                  ? history[history.length - 1].createdAt
                  : null;
            }
         } catch (error) {
            if (!ignore) {
               console.error('Không thể tải lịch sử chat:', error);
               message.error(error.response?.data?.message || 'Không thể tải lịch sử chat');
            }
         } finally {
            if (!ignore) {
               setHistoryLoading(false);
            }
         }
      };

      loadHistory();
      return () => { ignore = true; };
   }, [selectedOrderId, selectedItemId]);

   useEffect(() => {
      if (!selectedOrderId || !selectedItemId) return;
      let cancelled = false;

      const startPolling = async () => {
         while (!cancelled) {
            try {
               const controller = new AbortController();
               pollAbortRef.current = controller;
               const params = { orderItemId: selectedItemId };
               if (lastTimestampRef.current) {
                  params.since = lastTimestampRef.current;
               }
               const response = await chatService.longPoll(selectedOrderId, {
                  params,
                  signal: controller.signal
               });
               if (cancelled) return;

               if (response.data?.success) {
                  const incoming = response.data.data || [];
                  if (incoming.length) {
                     setMessages(prev => mergeMessages(prev, incoming));
                     lastTimestampRef.current = incoming[incoming.length - 1].createdAt;
                  }
               }
            } catch (error) {
               if (error.code === 'ERR_CANCELED') {
                  return;
               }
               console.error('Lỗi long polling:', error);
               await new Promise(resolve => setTimeout(resolve, 1500));
            }
         }
      };

      startPolling();
      return () => {
         cancelled = true;
         pollAbortRef.current?.abort();
      };
   }, [selectedOrderId, selectedItemId]);

   useEffect(() => {
      scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages]);

   const handleSend = async () => {
      if (!selectedOrderId || !selectedItemId) {
         message.warning('Vui lòng chọn đơn hàng để chat');
         return;
      }
      const content = inputValue.trim();
      if (!content) return;

      setSending(true);
      try {
         const response = await chatService.sendMessage({
            orderId: selectedOrderId,
            orderItemId: selectedItemId,
            message: content
         });
         if (response.data?.success) {
            const sent = response.data.data;
            setMessages(prev => mergeMessages(prev, [sent]));
            lastTimestampRef.current = sent.createdAt;
            setInputValue('');
         }
      } catch (error) {
         console.error('Không thể gửi tin nhắn:', error);
         message.error(error.response?.data?.message || 'Không thể gửi tin nhắn');
      } finally {
         setSending(false);
      }
   };

   const allowSend = meta?.canChat && !sending;
   const customerInfo = meta?.customer;

   return (
      <div className="p-4 md:p-6 space-y-6">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-semibold text-blue-900">Chat với khách hàng</h1>
               <p className="text-gray-500">Trao đổi thông tin giao nhận cùng khách.</p>
            </div>
            <Button
               icon={<ReloadOutlined />}
               onClick={fetchOrders}
               loading={ordersLoading}
            >
               Làm mới đơn
            </Button>
         </div>

         <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3 space-y-3">
               <h2 className="text-lg font-semibold text-gray-800">Đơn của bạn</h2>
               {ordersError && (
                  <Alert
                     type="error"
                     showIcon
                     message="Không thể tải đơn"
                     description={ordersError}
                  />
               )}
               {ordersLoading ? (
                  <div className="flex justify-center py-12">
                     <Spin />
                  </div>
               ) : orders.length ? (
                  <div className="space-y-3">
                     {orders.map(order => {
                        const driverItem = order.items?.find(item => item.driverId);
                        return (
                           <button
                              key={order._id}
                              type="button"
                              onClick={() => setSelectedOrderId(order._id)}
                              className={`w-full text-left rounded-xl border p-4 transition ${
                                 String(selectedOrderId) === String(order._id)
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-400'
                              }`}
                           >
                              <div className="flex items-center justify-between">
                                 <span className="font-semibold text-gray-800">
                                    Đơn #{String(order._id).slice(-6)}
                                 </span>
                                 <Tag color={order.status === 'Completed' ? 'green' : 'blue'}>
                                    {order.status}
                                 </Tag>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                 {order.pickupAddress} → {order.dropoffAddress}
                              </p>
                              <p className="text-sm text-gray-600 mt-2">
                                 Khách: {order.customerId?.name || 'Ẩn danh'}
                              </p>
                              {driverItem?.status && (
                                 <p className="text-xs text-gray-500 mt-1">
                                    Trạng thái chuyến: {driverItem.status}
                                 </p>
                              )}
                           </button>
                        );
                     })}
                  </div>
               ) : (
                  <Empty description="Chưa có đơn nào" />
               )}
            </div>

            <div className="flex-1">
               <div className="bg-white rounded-2xl shadow p-4 md:p-6 h-full flex flex-col">
                  {!selectedOrderId ? (
                     <div className="flex-1 flex items-center justify-center">
                        <Empty description="Chọn một đơn để bắt đầu chat" />
                     </div>
                  ) : (
                     <>
                        <div className="border-b pb-4 mb-4">
                           <div className="flex flex-wrap items-center gap-3 justify-between">
                              <div>
                                 <p className="text-sm text-gray-500">Đang chat với khách</p>
                                 <p className="text-lg font-semibold text-gray-900">
                                    {customerInfo?.name || 'Khách hàng'}
                                 </p>
                                 <p className="text-sm text-gray-500">
                                    {meta?.pickupAddress} → {meta?.dropoffAddress}
                                 </p>
                              </div>
                              <div className="text-right">
                                 <Tag color={meta?.canChat ? 'blue' : 'default'}>
                                    {meta?.canChat ? 'Đang hoạt động' : 'Đã khóa'}
                                 </Tag>
                                 {customerInfo?.phone && (
                                    <p className="text-sm text-gray-600">☎ {customerInfo.phone}</p>
                                 )}
                              </div>
                           </div>
                           {metaLoading && (
                              <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                                 <Spin size="small" /> Đang tải thông tin chat...
                              </div>
                           )}
                           {driverItemOptions.length > 1 && (
                              <div className="mt-4">
                                 <p className="text-sm text-gray-500 mb-1">Chọn chuyến hàng</p>
                                 <Select
                                    className="w-full md:w-64"
                                    value={selectedItemId || undefined}
                                    onChange={(value) => {
                                       setSelectedItemId(value);
                                       setMessages([]);
                                       lastTimestampRef.current = null;
                                    }}
                                 >
                                    {driverItemOptions.map(option => (
                                       <Select.Option
                                          key={option.orderItemId}
                                          value={option.orderItemId}
                                       >
                                          #{String(option.orderItemId).slice(-5)} • {option.status}
                                       </Select.Option>
                                    ))}
                                 </Select>
                              </div>
                           )}
                           {!meta?.canChat && meta?.lockedReason && (
                              <Alert className="mt-3" type="info" showIcon message={meta.lockedReason} />
                           )}
                        </div>

                        <div className="flex-1 flex flex-col min-h-[420px]">
                           <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                              {historyLoading ? (
                                 <div className="flex justify-center py-10">
                                    <Spin />
                                 </div>
                              ) : messages.length ? (
                                 messages.map(msg => {
                                    const isDriver = msg.senderRole === 'Driver';
                                    return (
                                       <div
                                          key={msg._id}
                                          className={`max-w-full md:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                                             isDriver
                                                ? 'bg-blue-600 text-white ml-auto'
                                                : 'bg-gray-100 text-gray-900'
                                          }`}
                                       >
                                          <div className="text-sm whitespace-pre-line break-words">
                                             {msg.message}
                                          </div>
                                          <div className={`text-xs mt-1 opacity-75 ${isDriver ? 'text-blue-100' : 'text-gray-500'}`}>
                                             {msg.senderId?.name || msg.senderRole} • {formatTime(msg.createdAt)}
                                          </div>
                                       </div>
                                    );
                                 })
                              ) : (
                                 <div className="flex justify-center py-10">
                                    <Empty description="Chưa có tin nhắn" />
                                 </div>
                              )}
                              <div ref={scrollAnchorRef} />
                           </div>

                           <div className="border-t pt-3 mt-3">
                              <TextArea
                                 disabled={!meta?.canChat}
                                 autoSize={{ minRows: 2, maxRows: 4 }}
                                 placeholder={meta?.canChat ? 'Nhập tin nhắn...' : meta?.lockedReason || 'Chat đã bị khóa'}
                                 value={inputValue}
                                 onChange={(e) => setInputValue(e.target.value)}
                                 onPressEnter={(e) => {
                                    if (!e.shiftKey) {
                                       e.preventDefault();
                                       handleSend();
                                    }
                                 }}
                              />
                              <div className="flex justify-end mt-3">
                                 <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    onClick={handleSend}
                                    disabled={!allowSend}
                                    loading={sending}
                                 >
                                    Gửi
                                 </Button>
                              </div>
                           </div>
                        </div>
                     </>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
