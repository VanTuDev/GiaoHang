import axiosClient from "../../../authentication/api/axiosClient";
import { ADMIN_ENDPOINTS } from "./endpoints";

export const adminService = {
   listUsers: (params) => axiosClient.get(ADMIN_ENDPOINTS.users, { params }),
   getUser: (id) => axiosClient.get(ADMIN_ENDPOINTS.userById(id)),
};


