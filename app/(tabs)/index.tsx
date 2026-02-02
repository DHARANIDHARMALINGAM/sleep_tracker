/**
 * Index Redirect
 * 
 * Redirects from the index route to the today tab.
 */

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/today" />;
}
