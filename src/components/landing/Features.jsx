const items = [
   { title: "An toàn tuyệt đối", desc: "Bảo hiểm đơn hàng, xác minh tài xế.", icon: "🛡️" },
   { title: "Nhanh chóng", desc: "Kết nối tài xế dưới 2 phút.", icon: "⚡" },
   { title: "Chất lượng cao", desc: "Tài xế được đào tạo, hỗ trợ 24/7.", icon: "⭐" },
];

export default function Features() {
   return (
      <section className="bg-white">
         <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="text-center">
               <h2 className="text-3xl font-bold tracking-tight text-gray-900">Tại sao chọn chúng tôi?</h2>
               <p className="mt-3 text-gray-600">Dịch vụ tin cậy cho doanh nghiệp và cá nhân tại Đà Nẵng.</p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
               {items.map((it) => (
                  <div key={it.title} className="rounded-xl border border-gray-100 p-6 shadow-sm">
                     <div className="text-3xl">{it.icon}</div>
                     <h3 className="mt-4 text-lg font-semibold text-gray-900">{it.title}</h3>
                     <p className="mt-2 text-gray-600">{it.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}


