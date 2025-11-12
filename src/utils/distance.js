/**
 * Tính khoảng cách đường bộ giữa hai điểm sử dụng OSRM API
 * Fallback về Haversine formula nếu OSRM API thất bại
 * 
 * @param {number} lat1 - Vĩ độ điểm 1
 * @param {number} lng1 - Kinh độ điểm 1
 * @param {number} lat2 - Vĩ độ điểm 2
 * @param {number} lng2 - Kinh độ điểm 2
 * @returns {Promise<number>} Khoảng cách tính bằng km
 */
export async function calculateRoadDistance(lat1, lng1, lat2, lng2) {
   // Kiểm tra tính hợp lệ của tọa độ
   if (!lat1 || !lng1 || !lat2 || !lng2) {
      return 0;
   }

   // Thử sử dụng OSRM API để tính khoảng cách đường bộ
   try {
      // OSRM API endpoint (sử dụng public server)
      const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false&alternatives=false&steps=false`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
         // Khoảng cách tính bằng mét, chuyển sang km
         const distanceInMeters = data.routes[0].distance;
         const distanceInKm = distanceInMeters / 1000;
         return Math.round(distanceInKm * 10) / 10; // Làm tròn 1 chữ số thập phân
      }
   } catch (error) {
      console.warn('OSRM API error, falling back to Haversine:', error);
   }

   // Fallback: Sử dụng Haversine formula để tính khoảng cách đường chim bay
   return calculateHaversineDistance(lat1, lng1, lat2, lng2);
}

/**
 * Tính khoảng cách đường chim bay giữa hai điểm sử dụng Haversine formula
 * 
 * @param {number} lat1 - Vĩ độ điểm 1
 * @param {number} lng1 - Kinh độ điểm 1
 * @param {number} lat2 - Vĩ độ điểm 2
 * @param {number} lng2 - Kinh độ điểm 2
 * @returns {number} Khoảng cách tính bằng km (làm tròn 1 chữ số thập phân)
 */
export function calculateHaversineDistance(lat1, lng1, lat2, lng2) {
   // Bán kính Trái Đất (km)
   const R = 6371;
   
   // Chuyển đổi độ sang radian
   const dLat = toRadians(lat2 - lat1);
   const dLng = toRadians(lng2 - lng1);
   
   // Công thức Haversine
   const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
   
   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
   const distance = R * c;
   
   // Làm tròn 1 chữ số thập phân
   return Math.round(distance * 10) / 10;
}

/**
 * Chuyển đổi độ sang radian
 * 
 * @param {number} degrees - Góc tính bằng độ
 * @returns {number} Góc tính bằng radian
 */
function toRadians(degrees) {
   return degrees * (Math.PI / 180);
}

