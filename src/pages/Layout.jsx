import Header from './Header'
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/authContext';
import useLocationUpdater from '../utils/useLocationUpdater';

const pageTitles = {
//   '/add-items': 'Add Item',
//   '/manage-items': 'Manage Items',
  '/profile': 'Profile',
  '/earning': 'Earning',
  '/home': 'Order',
};

const Layout = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { dpProfile, selectedDpId } = useAuth();
  console.log("dpProfile", dpProfile);

  const DpId = dpProfile?.dp_id || selectedDpId; // ✅ fallback

  useLocationUpdater(DpId);

  // Set title from map or fallback
  const title = pageTitles[pathname] || 'Dashboard';

  return (
    <>
      <Header title={title} />
      <div className="pt-[30px] pb-10">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
