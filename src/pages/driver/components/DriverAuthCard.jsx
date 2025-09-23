export default function DriverAuthCard({ title, subtitle, children }) {
   return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
         <div className="w-full max-w-md bg-white border border-blue-100 rounded-xl shadow p-6">
            <div className="mb-6 text-center">
               <h1 className="text-2xl font-semibold text-blue-900">{title}</h1>
               {subtitle ? (
                  <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
               ) : null}
            </div>
            {children}
         </div>
      </div>
   );
}


