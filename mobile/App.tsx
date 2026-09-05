import { SafeAreaProvider } from 'react-native-safe-area-context';

import SearchScreen from './src/screens/SearchScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <SearchScreen />
    </SafeAreaProvider>
  );
}
