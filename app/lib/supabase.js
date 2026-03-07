import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// SecureStore wrapper per i token di autenticazione
const secureStorage = {
  async getItem(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('[SecureStore] getItem error:', error);
      return null;
    }
  },
  async setItem(key, value) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('[SecureStore] setItem error:', error);
    }
  },
  async removeItem(key) {
    try {
      return await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('[SecureStore] removeItem error:', error);
    }
  },
};

// Usa SecureStore su mobile, AsyncStorage su web
const storageProvider = Platform.OS === 'web' ? AsyncStorage : secureStorage;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: storageProvider,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: Platform.OS === 'web' ? true : false,
  },
});
