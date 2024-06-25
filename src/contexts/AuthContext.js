import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getCredentials, saveCredentials as saveUserCredentials } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credentialsConfigured, setCredentialsConfigured] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const credentials = await getCredentials(user.uid);
          setCredentialsConfigured(!!credentials.token && !!credentials.mId);
        } catch (error) {
          console.error('Error al obtener las credenciales:', error.message);
          setCredentialsConfigured(false);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const saveCredentials = async (uid, credentials) => {
    await saveUserCredentials(uid, credentials);
    setCredentialsConfigured(!!credentials.token && !!credentials.mId);
  };

  const value = {
    currentUser,
    credentialsConfigured,
    saveCredentials,
    logout: () => auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
