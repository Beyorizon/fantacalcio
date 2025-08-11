import AppLayout from '../layouts/AppLayout';
import Card from '../ui/Card';

export default function Aggiornamenti() {
  return (
    <AppLayout title="Aggiornamenti">
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Ultime Novità
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Qui mostreremo le ultime novità del fantacalcio.
        </p>
      </Card>
    </AppLayout>
  );
}
  