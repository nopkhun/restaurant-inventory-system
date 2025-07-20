import { useQuery } from '@tanstack/react-query';
import { getStockMovements } from '../api/stockApi';

export default function StockPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['stock'],
    queryFn: getStockMovements
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Stock Movements</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {data?.map((movement) => (
            <div key={movement.id} className="border p-4 rounded-lg">
              <div className="flex justify-between">
                <span>#{movement.id}</span>
                <span>{new Date(movement.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-2">
                <p>From: {movement.fromLocation}</p>
                <p>To: {movement.toLocation}</p>
                <p>Quantity: {movement.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
