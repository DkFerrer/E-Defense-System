import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { isAuthenticated } = useAuth();
  return <Redirect href={isAuthenticated ? '/(main)/research-groups' : '/login'} />;
}
