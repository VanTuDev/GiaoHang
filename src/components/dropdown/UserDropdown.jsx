import { Dropdown, Avatar } from "antd";

export default function UserDropdown({ user, onInfo, onSettings, onLogout, children }) {
   const items = [
      { key: "info", label: "Thông tin", onClick: onInfo },
      { key: "settings", label: "Cài đặt", onClick: onSettings },
      { type: "divider" },
      { key: "logout", label: "Đăng xuất", onClick: onLogout },
   ];

   return (
      <Dropdown menu={{ items }}>
         {children || (
            <div className="flex items-center gap-2 cursor-pointer">
               <Avatar size={36} src={user?.avatarUrl} className="bg-green-700">
                  {user?.name?.[0]?.toUpperCase()}
               </Avatar>
               <div className="leading-tight">
                  <div className="font-medium">{user?.name || "Người dùng"}</div>
                  <div className="text-xs text-gray-500">{user?.role || ""}</div>
               </div>
            </div>
         )}
      </Dropdown>
   );
}


