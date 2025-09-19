export default function CTA() {
   return (
      <section className="bg-white">
         <div className="mx-auto max-w-4xl px-4 py-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sẵn sàng bắt đầu?</h2>
            <p className="mt-3 text-gray-600">
               Tham gia cộng đồng GiaoHangDaNang ngay hôm nay. Trải nghiệm vận chuyển thông minh và an toàn.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
               <a href="/auth/login" className="rounded-md bg-green-700 px-6 py-3 text-white hover:bg-green-800">Đặt xe ngay</a>
               <a href="/auth/register" className="rounded-md border border-green-700 px-6 py-3 text-green-700 hover:bg-green-50">Đăng ký tài xế</a>
            </div>
         </div>
      </section>
   );
}


