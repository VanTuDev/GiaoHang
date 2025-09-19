const stats = [
   { label: "Khách hàng", value: "10,000+" },
   { label: "Tài xế hoạt động", value: "2,500+" },
   { label: "Chuyến thành công", value: "50,000+" },
   { label: "Đánh giá", value: "4.8★" },
];

export default function Stats() {
   return (
      <section className="bg-green-700 text-white">
         <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
               {stats.map((s) => (
                  <div key={s.label} className="text-center">
                     <div className="text-3xl font-semibold">{s.value}</div>
                     <div className="mt-1 text-sm opacity-80">{s.label}</div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}


