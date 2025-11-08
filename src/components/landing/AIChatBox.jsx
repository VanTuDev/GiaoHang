import { useState, useRef, useEffect } from 'react';
import { MessageOutlined, CloseOutlined, SendOutlined, RobotOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { axiosClient } from '../../authentication/api/axiosClient';

const AIChatBox = () => {
   const [isOpen, setIsOpen] = useState(false);
   const [messages, setMessages] = useState([
      {
         role: 'assistant',
         content: 'Xin chào! Tôi là trợ lý AI của dịch vụ giao hàng Đà Nẵng. Tôi có thể tư vấn cho bạn về các loại xe, dịch vụ vận chuyển, giá cả và cách đặt đơn hàng. Bạn cần hỗ trợ gì?'
      }
   ]);
   const [inputMessage, setInputMessage] = useState('');
   const [loading, setLoading] = useState(false);
   const messagesEndRef = useRef(null);
   const inputRef = useRef(null);

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   };

   useEffect(() => {
      scrollToBottom();
   }, [messages]);

   useEffect(() => {
      if (isOpen && inputRef.current) {
         inputRef.current.focus();
      }
   }, [isOpen]);

   const handleSendMessage = async () => {
      if (!inputMessage.trim() || loading) return;

      const userMessage = inputMessage.trim();
      setInputMessage('');
      
      // Thêm user message vào UI
      const newUserMessage = {
         role: 'user',
         content: userMessage
      };
      setMessages(prev => [...prev, newUserMessage]);
      setLoading(true);

      try {
         // Lấy conversation history (bỏ message đầu tiên - welcome message)
         const conversationHistory = messages.slice(1).map(msg => ({
            role: msg.role,
            content: msg.content
         }));

         // Gọi API
         const response = await axiosClient.post('/api/ai/chat', {
            message: userMessage,
            conversationHistory
         });

         if (response.data.success) {
            const aiMessage = {
               role: 'assistant',
               content: response.data.data.message
            };
            setMessages(prev => [...prev, aiMessage]);
         } else {
            throw new Error(response.data.message || 'Lỗi khi gửi tin nhắn');
         }
      } catch (error) {
         console.error('Lỗi khi chat với AI:', error);
         const errorMessage = {
            role: 'assistant',
            content: 'Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi của bạn. Vui lòng thử lại sau hoặc liên hệ trực tiếp với chúng tôi.'
         };
         setMessages(prev => [...prev, errorMessage]);
      } finally {
         setLoading(false);
      }
   };

   const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         handleSendMessage();
      }
   };

   return (
      <>
         {/* Chat Button */}
         {!isOpen && (
            <button
               onClick={() => setIsOpen(true)}
               className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-900 text-white shadow-lg transition-all hover:scale-110 hover:bg-blue-800"
               aria-label="Mở chat với AI"
            >
               <MessageOutlined className="text-2xl" />
            </button>
         )}

         {/* Chat Box */}
         {isOpen && (
            <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] flex-col rounded-lg border border-gray-200 bg-white shadow-2xl">
               {/* Header */}
               <div className="flex items-center justify-between border-b border-gray-200 bg-blue-900 px-4 py-3 text-white">
                  <div className="flex items-center gap-2">
                     <RobotOutlined className="text-xl" />
                     <div>
                        <h3 className="font-semibold">Trợ lý AI</h3>
                        <p className="text-xs text-blue-100">Tư vấn dịch vụ vận chuyển</p>
                     </div>
                  </div>
                  <button
                     onClick={() => setIsOpen(false)}
                     className="rounded p-1 hover:bg-blue-800"
                     aria-label="Đóng chat"
                  >
                     <CloseOutlined className="text-lg" />
                  </button>
               </div>

               {/* Messages */}
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, index) => (
                     <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                     >
                        <div
                           className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              msg.role === 'user'
                                 ? 'bg-blue-900 text-white'
                                 : 'bg-gray-100 text-gray-800'
                           }`}
                        >
                           <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                     </div>
                  ))}
                  
                  {loading && (
                     <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg px-4 py-2">
                           <Spin size="small" />
                        </div>
                     </div>
                  )}
                  <div ref={messagesEndRef} />
               </div>

               {/* Input */}
               <div className="border-t border-gray-200 p-4">
                  <div className="flex gap-2">
                     <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập câu hỏi của bạn..."
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                        disabled={loading}
                     />
                     <button
                        onClick={handleSendMessage}
                        disabled={loading || !inputMessage.trim()}
                        className="rounded-md bg-blue-900 px-4 py-2 text-white transition-colors hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        aria-label="Gửi tin nhắn"
                     >
                        <SendOutlined />
                     </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                     AI có thể mắc lỗi. Vui lòng kiểm tra thông tin quan trọng.
                  </p>
               </div>
            </div>
         )}
      </>
   );
};

export default AIChatBox;

