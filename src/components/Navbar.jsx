import React, { useState, useEffect } from 'react';
import { Layout, Avatar, Menu, Dropdown, Modal, Form, Input, Button, message } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCredentials, saveCredentials as saveUserCredentials } from '../services/api';

const { Header } = Layout;

const Navbar = () => {
  const { currentUser, logout, saveCredentials } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadCredentials();
    }
  }, [currentUser]);

  const loadCredentials = async () => {
    try {
      const credentials = await getCredentials(currentUser.uid);
      form.setFieldsValue(credentials);
    } catch (error) {
      console.error('Error al cargar las credenciales:', error.message);
      message.error('Error al cargar las credenciales');
    }
  };

  const handleSaveCredentials = async (values) => {
    try {
      await saveCredentials(currentUser.uid, values);
      message.success('Credenciales guardadas correctamente');
      setIsModalVisible(false);
      navigate('/items', { replace: true });
    } catch (error) {
      message.error('Error al guardar las credenciales');
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<SettingOutlined />} onClick={() => setIsModalVisible(true)}>
        Configuración
      </Menu.Item>
      <Menu.Item key="2" icon={<LogoutOutlined />} onClick={()=>{
        navigate('/login', { replace: true })
        logout()
      }}>
        Cerrar Sesión
      </Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ color: 'white', fontSize: '20px' }}>
       GlobalStock Manager
      </div>
      {currentUser && (
        <Dropdown overlay={menu} trigger={['click']}>
          <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
        </Dropdown>
      )}
      <Modal
        title="Configurar Credenciales"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
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
      </Modal>
    </Header>
  );
};

export default Navbar;
