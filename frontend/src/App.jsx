import { Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminBooks from './pages/AdminBooks';
import AdminComments from './pages/AdminComments';
import AdminDashboard from './pages/AdminDashboard';
import AdminMessages from './pages/AdminMessages';
import AdminUsers from './pages/AdminUsers';
import AuthorAnalytics from './pages/AuthorAnalytics';
import AuthorProfile from './pages/AuthorProfile';
import BookDetails from './pages/BookDetails';
import Books from './pages/Books';
import Home from './pages/Home';
import Login from './pages/Login';
import Messages from './pages/Messages';
import MyBooks from './pages/MyBooks';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Register from './pages/Register';
import AuthorRoute from './routes/AuthorRoute';
import AdminRoute from './routes/AdminRoute';
import ProtectedRoute from './routes/ProtectedRoute';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/authors/:authorId" element={<AuthorProfile />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:slug" element={<BookDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
        </Route>

        <Route element={<AuthorRoute />}>
          <Route path="/my-books" element={<MyBooks />} />
          <Route path="/author-analytics" element={<AuthorAnalytics />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/books" element={<AdminBooks />} />
          <Route path="/admin/comments" element={<AdminComments />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
