import TopBar from '../ui/TopBar';
import BottomNav from '../ui/BottomNav';

const AppLayout = ({ title, right, children }) => {
  return (
    <div className="app-container min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title={title} right={right} />
      <main className="pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+64px)]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
