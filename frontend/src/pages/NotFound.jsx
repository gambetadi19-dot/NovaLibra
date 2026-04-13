import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="container-shell py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-display text-6xl text-white">This page is not in the catalog.</h1>
        <p className="mt-6 text-sm leading-7 text-slate-400">The route does not exist or the content has not been published yet.</p>
        <div className="mt-8">
          <Button as={Link} to="/">
            Return home
          </Button>
        </div>
      </div>
    </div>
  );
}
