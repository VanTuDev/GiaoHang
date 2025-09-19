export default function Hero() {
   return (
      <section className="bg-white">
         <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
               <div>
                  <p className="inline-block rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                     Giao hàng Đà Nẵng nhanh - an toàn - đúng giờ
                  </p>
                  <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                     Kết nối nhanh chóng, an toàn tuyệt đối
                  </h1>
                  <p className="mt-4 text-lg leading-8 text-gray-600">
                     Hệ thống đặt xe vận chuyển thông minh cho mọi nhu cầu: giấy tờ, hàng hóa đến 15 tấn.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                     <a
                        href="/auth/login"
                        className="inline-flex items-center justify-center rounded-md bg-green-700 px-6 py-3 text-white shadow-sm hover:bg-green-800"
                     >
                        Đặt xe ngay
                     </a>
                     <a
                        href="/auth/register"
                        className="inline-flex items-center justify-center rounded-md border border-green-700 px-6 py-3 text-green-700 hover:bg-green-50"
                     >
                        Trở thành tài xế
                     </a>
                  </div>
               </div>
               <div className="relative">
                  <div className="aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-green-100 via-white to-green-50 shadow-inner" />
               </div>
            </div>
         </div>
      </section>
   );
}


