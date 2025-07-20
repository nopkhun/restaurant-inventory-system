import axios from 'axios';

export interface StockMovement {
  id: number;
  ingredientId: number;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  movementType: string;
  createdAt: string;
}

export const getStockMovements = async (): Promise<StockMovement[]> => {
  const response = await axios.get('http://localhost:3000/api/stock');
  return response.data;
};

export const createStockMovement = async (
  data: Omit<StockMovement, 'id' | 'createdAt'>
) => {
  const response = await axios.post('http://localhost:3000/api/stock', data);
  return response.data;
};
