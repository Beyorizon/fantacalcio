import AppLayout from '../layouts/AppLayout';
import Card from '../ui/Card';

export default function News() {
  return (
    <AppLayout title="News">
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Ultime Novità
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Qui troverai le ultime notizie e aggiornamenti del fantacalcio.
        </p>
      </Card>
    </AppLayout>
  );
}
