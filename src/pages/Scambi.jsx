import AppLayout from '../layouts/AppLayout';
import Card from '../ui/Card';

export default function Scambi() {
  return (
    <AppLayout title="Scambi">
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Scambi
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Qui potrai gestire gli scambi tra giocatori.
        </p>
      </Card>
    </AppLayout>
  );
}
