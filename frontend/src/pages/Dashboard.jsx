import { useAuth } from '../context/AuthContext';
import LeadDashboard from '../components/BossDashboard';
import AssociateDashboard from '../components/WorkerDashboard';

const Dashboard = () => {
    const { user } = useAuth();
    return user?.role === 'Lead' ? <LeadDashboard /> : <AssociateDashboard />;
};

export default Dashboard;
