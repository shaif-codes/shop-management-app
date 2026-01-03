import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
// @ts-ignore
import { SENTRY_DSN } from '@env';
import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';

Sentry.init({
  dsn: SENTRY_DSN,
});

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
};

export default Sentry.wrap(App);
