import { useEffect } from 'react';
import { useRouter } from 'next/router';

// This is the default boilerplate content.
// We are replacing it with a redirect to your login page.
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the login page immediately when this component mounts
    router.push('/login');
  }, [router]); // Dependency array includes router to ensure effect runs if router changes (though it typically won't for this use case)

  // You can return a simple loading message or null while the redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <p className="text-gray-700 text-lg">Redirecting to login...</p>
    </div>
  );
}
