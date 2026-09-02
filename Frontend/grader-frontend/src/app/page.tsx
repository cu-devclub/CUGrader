import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function getUserRole() {
  const cookieStore = await cookies();
  const userInfoCookie = cookieStore.get('user_info');
  if (userInfoCookie) {
    try {
      const user = JSON.parse(userInfoCookie.value);
      return user?.role;
    } catch (error) {
      console.error('Error parsing user_info cookie:', error);
      return null;
    }
  }
  return null;
}

export default async function Home() {
  const role = await getUserRole();

  if (role) {
    switch (role) {
      case 'student':
        redirect('/student');
      case 'teacher':
        redirect('/instructor');
      case 'admin':
        redirect('/admin');
      default:
        redirect('/login');
    }
  } else {
    redirect('/login');
  }

  return null;
}
