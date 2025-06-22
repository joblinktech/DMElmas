import { Routes, Route, Navigate } from 'react-router-dom';
import { useSupabase } from './hooks/useSupabase';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import UpdatePasswordPage from './pages/auth/UpdatePasswordPage';
import CompleteProfilePage from './pages/auth/CompleteProfilePage';
import ProfilePage from './pages/profile/ProfilePage';
import ListingCreatePage from './pages/listings/ListingCreatePage';
import ListingDetailPage from './pages/listings/ListingDetailPage';
import SearchPage from './pages/search/SearchPage';
import MessagesPage from './pages/messages/MessagesPage';
import ChatPage from './pages/messages/ChatPage';
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage';
import PaymentFailurePage from './pages/payment/PaymentFailurePage';
import NotFoundPage from './pages/NotFoundPage';
import FAQPage from './pages/FAQPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import SettingsPage from './pages/profile/SettingsPage';
import HelpPage from './pages/HelpPage';
import EmailConfirmedPage from './pages/auth/EmailConfirmedPage';
import AchatCreditsPage from './pages/AchatCreditsPage';
import SellerProfilePage from './pages/profile/SellerProfilePage';

function App() {
  const { user, userProfile } = useSupabase();

  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      
      {/* Auth Routes */}
      <Route path="/login" element={
        user ? <Navigate to="/" replace /> : <Layout><LoginPage /></Layout>
      } />
      <Route path="/register" element={
        user ? <Navigate to="/" replace /> : <Layout><RegisterPage /></Layout>
      } />
      <Route path="/auth/reset-password" element={<Layout><ResetPasswordPage /></Layout>} />
      <Route path="/auth/update-password" element={<Layout><UpdatePasswordPage /></Layout>} />
      <Route path="/complete-profile" element={
        <Layout>
          <PrivateRoute>
            {userProfile ? <Navigate to="/" replace /> : <CompleteProfilePage />}
          </PrivateRoute>
        </Layout>
      } />
      <Route path="/email-confirmed" element={<Layout><EmailConfirmedPage /></Layout>} />
      
      {/* Listing Routes */}
      <Route path="/create-listing" element={
        <Layout>
          <PrivateRoute requireProfile>
            <ListingCreatePage />
          </PrivateRoute>
        </Layout>
      } />
      <Route path="/listings/:id" element={<Layout><ListingDetailPage /></Layout>} />
      
      {/* Search */}
      <Route path="/search" element={<Layout><SearchPage /></Layout>} />
      
      {/* Messages */}
      <Route path="/messages" element={
        <Layout>
          <PrivateRoute requireProfile>
            <MessagesPage />
          </PrivateRoute>
        </Layout>
      } />
      <Route path="/messages/:listingId/:userId" element={
        <Layout>
          <PrivateRoute requireProfile>
            <ChatPage />
          </PrivateRoute>
        </Layout>
      } />
      
      {/* Profile */}
      <Route path="/profile" element={
        <Layout>
          <PrivateRoute requireProfile>
            <ProfilePage />
          </PrivateRoute>
        </Layout>
      } />
      <Route path="/settings" element={
        <Layout>
          <PrivateRoute requireProfile>
            <SettingsPage />
          </PrivateRoute>
        </Layout>
      } />
      <Route path="/profile/seller/:sellerId" element={<SellerProfilePage />} />
      
      {/* Payment */}
      <Route path="/payment/success" element={<Layout><PaymentSuccessPage /></Layout>} />
      <Route path="/payment/failure" element={<Layout><PaymentFailurePage /></Layout>} />
      
      {/* Info Pages */}
      <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
      <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
      <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
      <Route path="/help" element={<Layout><HelpPage /></Layout>} />
      
      {/* Achat Credits */}
      <Route path="/acheter-credits" element={
        <Layout>
          <PrivateRoute requireProfile>
            <AchatCreditsPage />
          </PrivateRoute>
        </Layout>
      } />
      
      {/* 404 */}
      <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
    </Routes>
  );
}

export default App;