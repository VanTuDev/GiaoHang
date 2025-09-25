import { ThunderboltOutlined, CarOutlined, TruckOutlined, ContainerOutlined } from "@ant-design/icons";

const services = [
   { name: "Xe máy", desc: "Giấy tờ, đồ ăn, giao nhanh", icon: <ThunderboltOutlined /> },
   { name: "Bán tải", desc: "Hàng vừa, đồ gia dụng", icon: <CarOutlined /> },
   { name: "Tải nhỏ", desc: "Chuyển nhà, hàng lớn", icon: <TruckOutlined /> },
   { name: "Tải lớn", desc: "Hàng nặng đến 15 tấn", icon: <ContainerOutlined /> },
];

export default function Services() {
   return (
      <section className="bg-gray-50" id="services">
         <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="text-center">
               <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dịch vụ</h2>
               <p className="mt-3 text-gray-600">Đa dạng phương tiện, phù hợp mọi nhu cầu</p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
               {services.map((s) => (
                  <div key={s.name} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-blue-100">
                     <div className="text-3xl text-blue-900">{s.icon}</div>
                     <h3 className="mt-4 text-lg font-semibold text-gray-900">{s.name}</h3>
                     <p className="mt-2 text-gray-600">{s.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}


