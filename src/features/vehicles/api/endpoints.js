export const VEHICLE_ENDPOINTS = {
   types: "/api/vehicles/types",
   list: "/api/vehicles",
   myVehicles: "/api/vehicles/my-vehicles",
   addVehicle: "/api/vehicles",
   updateVehicle: (id) => `/api/vehicles/${id}`,
   deleteVehicle: (id) => `/api/vehicles/${id}`,
};