import { FacebookOutlined, InstagramOutlined, YoutubeOutlined } from "@ant-design/icons";

export default function Footer() {
   return (
      <footer className="bg-gray-50" id="contact">
         <div className="mx-auto max-w-7xl px-4 py-10 flex items-center justify-between">
            <div className="text-sm text-gray-600">© 2024 Bengo. All rights reserved.</div>
            <div className="flex items-center gap-4 text-xl text-blue-900">
               <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FacebookOutlined /></a>
               <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><YoutubeOutlined /></a>
               <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramOutlined /></a>
            </div>
         </div>
      </footer>
   );
}


