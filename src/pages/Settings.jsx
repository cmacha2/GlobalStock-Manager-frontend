import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { saveCredentials, getCredentials } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { currentUser, saveCredentials } = useAuth();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const credentials = await getCredentials(currentUser.uid);
        if (credentials) {
          form.setFieldsValue(credentials);
        }
      } catch (error) {
        message.error('Error al cargar las credenciales');
      }
    };

    if (currentUser) {
      loadCredentials();
    }
  }, [currentUser, form]);

  const handleSaveCredentials = async (values) => {
    try {
      await saveCredentials(currentUser.uid, values);
      message.success('Credenciales guardadas correctamente');
      navigate('/items', { replace: true });
    } catch (error) {
      message.error('Error al guardar las credenciales');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '50px 0' }}>
      <Form form={form} layout="vertical" onFinish={handleSaveCredentials}>
        <Form.Item name="token" label="Token" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="mId" label="Merchant ID" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Guardar</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Settings;
