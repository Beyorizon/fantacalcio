import TopBar from '../ui/TopBar';
import BottomNav from '../ui/BottomNav';

const AppLayout = ({ title, right, children }) => {
  return (
    <div className="app-container min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <TopBar title={title} right={right} />
      <main className="pb-24 pt-3">{children}</main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
