import React, {useEffect, useState} from 'react';
import {SafeAreaView, Text} from 'react-native';
// const {Samsung, KEYS, APPS} = require('samsung-tv-control');

function RemotePage() {
  const [isSynced, setIsSynced] = useState(false);
  useEffect(() => {
    async function syncDevice() {
      const config = {
        debug: true, // Default: false
        ip: '192.168.1.2',
        mac: '123456789ABC',
        name: 'NodeJS-Test', // Default: NodeJS
        port: 8001, // Default: 8002
        token: '12345678',
      };
    }
    // syncDevice();
  }, [isSynced]);
  return (
    <SafeAreaView>
      <Text>Hello</Text>
    </SafeAreaView>
  );
}

export default RemotePage;
