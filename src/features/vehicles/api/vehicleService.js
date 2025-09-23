import axiosClient from "../../../authentication/api/axiosClient";
import { VEHICLE_ENDPOINTS } from "./endpoints";

export const vehicleService = {
   getTypes: (params) => axiosClient.get(VEHICLE_ENDPOINTS.types, { params }),
};


