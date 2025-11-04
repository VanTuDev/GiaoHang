import axiosClient from '../../../authentication/api/axiosClient';
import { PAYMENTS_ENDPOINTS } from './endpoints';

export const paymentsService = {
  createVnPayUrl: ({ orderId, orderItemId, amount, bankCode }) => {
    return axiosClient.post(PAYMENTS_ENDPOINTS.createVnPayUrl, {
      orderId,
      orderItemId,
      amount,
      bankCode,
    });
  },
};


