export default function AuthCard({ title, subtitle, children }) {
   return (
      <div className="min-h-screen flex items-center justify-center bg-white">
         <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="mb-6 text-center">
               <h1 className="text-2xl font-semibold text-green-700">{title}</h1>
               {subtitle ? (
                  <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
               ) : null}
            </div>
            {children}
         </div>
      </div>
   );
}


