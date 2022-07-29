/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {type PropsWithChildren, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Samsung from './src/services/connect-samsung-tv';
import KEYS from './src/services/keys';
import {Button, Icon} from '@rneui/themed';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const config = {
      debug: true, // Default: false
      ip: '192.168.1.68',
      mac: '123456789ABC',
      nameApp: 'Samsung-Remote-apps', // Default: NodeJS
      port: 8002, // Default: 8002
      token: 'abc1234567896543',
      saveToken: true,
    };
    let samsung = new Samsung(config);
    samsung.turnOn();
    // samsung.isAvailable();
    // samsung.getToken();
    // samsung.sendKey(KEYS.KEY_MENU);
    console.log(samsung);
  });
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            height: 150,
          }}>
          <View style={{flex: 1, height: 150, justifyContent: 'center'}}>
            <Button title="UP" icon={<Icon name="adjust" />} />
          </View>
          <View style={{flex: 1}}>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-start',
                alignContent: 'flex-start',
              }}>
              <Button title="UP" />
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                alignContent: 'flex-end',
              }}>
              <Button title="UP" />
            </View>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
            }}>
            <Button title="UP" />
          </View>
          {/* <View style={{flex: 1, width: 150, backgroundColor: 'green'}}>
            <Button title="DOWN" />
          </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  programButton: {
    width: 100,
    height: 1000,
    maxHeight: 400,
  },
});

export default App;
