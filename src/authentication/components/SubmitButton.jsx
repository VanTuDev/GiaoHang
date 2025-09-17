import { Button } from "antd";

export default function SubmitButton({ loading, children, className, ...rest }) {
   return (
      <Button
         type="primary"
         htmlType="submit"
         loading={loading}
         className={`!bg-green-700 hover:!bg-green-800 ${className || ""}`}
         {...rest}
      >
         {children}
      </Button>
   );
}


