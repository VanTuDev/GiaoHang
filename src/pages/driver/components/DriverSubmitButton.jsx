import { Button } from "antd";

export default function DriverSubmitButton({ loading, children, className, ...rest }) {
   return (
      <Button
         type="primary"
         htmlType="submit"
         loading={loading}
         className={`!bg-blue-900 hover:!bg-blue-800 ${className || ""}`}
         {...rest}
      >
         {children}
      </Button>
   );
}


