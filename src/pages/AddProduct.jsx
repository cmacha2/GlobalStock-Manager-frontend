import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Upload, Button, Select, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { createProduct, getNextSku } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { Option } = Select;

const AddProduct = ({ isModalVisible, setIsModalVisible, fetchItems }) => {
  const { currentUser } = useAuth();
  const [form] = Form.useForm();
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [sku, setSku] = useState('');
  const [fileList, setFileList] = useState([]);

  const handleAddProduct = async (values) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('category', values.category);
      formData.append('subcategory', values.subcategory);
      formData.append('price', values.price * 100);
      formData.append('stockCount', values.stockCount || 1);
      formData.append('cost', values.cost * 100);
      formData.append('sku', sku);
      formData.append('userId', currentUser.uid); // Include userId
      if (fileList.length > 0) {
        formData.append('image', fileList[0].originFileObj);
      }
      console.log('Form data:', formData);
      await createProduct(formData);
      message.success('Product created successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchItems(); // Reload products after adding a new one
    } catch (error) {
      message.error('Error creating product');
    }
  };

  const handleCategoryChange = async (value) => {
    setCategory(value);
    try {
      const skuPrefixMap = {
        Rings: 'RI-',
        Chains: 'CH-',
        Bracelets: 'BR-',
        Earrings: 'EA-',
        Necklaces: 'NE-',
        Watches: 'WA-',
        Pendants: 'PE-'
      };

      const skuPrefix = skuPrefixMap[value];
      if (!skuPrefix) {
        throw new Error('Invalid category value');
      }
      console.log('SKU Prefix:', skuPrefix);
      const response = await getNextSku(currentUser.uid, value); // Include userId
      const skuNumber = response.count;
      console.log('SKU Number:', skuNumber);
      setSku(`${skuPrefix}${String(skuNumber).padStart(5, '0')}`);
      form.setFieldsValue({ sku: `${skuPrefix}${String(skuNumber).padStart(5, '0')}` });
    } catch (error) {
      message.error('Error generating SKU');
      console.error('SKU Generation Error:', error);
    }
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const subcategoryOptions = {
    Rings: ['Normal', 'Diamond'],
    Chains: ['Monaco', 'Semi Solid', 'Solid', 'Rope', 'Franco', 'Curb', 'Princesa', 'Diamond'],
    Bracelets: ['Monaco', 'Semi Solid', 'Solid', 'Rope', 'Franco', 'Curb', 'Princesa'],
    Earrings: ['Normal', 'Diamond'],
    Necklaces: ['Normal', 'Diamond'],
    Watches: ['Bulova'],
    Pendants: ['Diamond', 'Normal']
  };

  return (
    <Modal
      title="Add Product"
      visible={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleAddProduct} 
        initialValues={{ stockCount: 1 }}
      >
        <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select placeholder="Select Category" onChange={handleCategoryChange}>
            <Option value="Rings">Rings</Option>
            <Option value="Chains">Chains</Option>
            <Option value="Bracelets">Bracelets</Option>
            <Option value="Earrings">Earrings</Option>
            <Option value="Necklaces">Necklaces</Option>
            <Option value="Watches">Watches</Option>
            <Option value="Pendants">Pendants</Option>
          </Select>
        </Form.Item>
        {category && (
          <Form.Item name="subcategory" label="Subcategory" rules={[{ required: true }]}>
            <Select placeholder="Select Subcategory">
              {subcategoryOptions[category].map((sub) => (
                <Option key={sub} value={sub}>
                  {sub}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
        <Form.Item name="sku" label="SKU">
          <Input value={sku} readOnly className="readonly-input" />
        </Form.Item>
        <Form.Item name="price" label="Price (USD)" rules={[{ required: true }]}>
          <InputNumber min={0} step={0.01} />
        </Form.Item>
        <Form.Item name="cost" label="Cost (USD)" rules={[{ required: true }]}>
          <InputNumber min={0} step={0.01} />
        </Form.Item>
        <Form.Item name="image" label="Image">
          <Upload
            name="image"
            listType="picture"
            beforeUpload={() => false}
            onChange={handleFileChange}
            fileList={fileList}
          >
            <Button icon={<UploadOutlined />}>Upload Image</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Add Product</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProduct;
