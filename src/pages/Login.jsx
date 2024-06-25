import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { credentialsConfigured } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      message.success('Inicio de sesión exitoso');
      if (credentialsConfigured) {
        navigate('/items');
      } else {
        navigate('/settings');
      }
    } catch (error) {
      message.error('Error al iniciar sesión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: 'auto', padding: '50px 0' }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="email" label="Correo Electrónico" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Contraseña" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>Iniciar Sesión</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
