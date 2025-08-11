import AppLayout from '../layouts/AppLayout';
import Card from '../ui/Card';

export default function Regolamento() {
  return (
    <AppLayout title="Regolamento">
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Regolamento
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Qui troverai il regolamento completo del fantacalcio.
        </p>
      </Card>
    </AppLayout>
  );
}
