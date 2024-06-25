import React, { useState, useEffect } from 'react';
import { Table, Button, message, DatePicker, Input, InputNumber } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getItems } from '../services/api';
import moment from 'moment';
import './Items.css';
import { useAuth } from '../contexts/AuthContext';
import AddProduct from './AddProduct';

const { RangePicker } = DatePicker;

const subcategoryOptions = {
  Rings: ['Normal', 'Diamond'],
  Chains: ['Monaco', 'Semi Solid', 'Solid', 'Rope', 'Franco', 'Curb', 'Princesa', 'Diamond'],
  Bracelets: ['Monaco', 'Semi Solid', 'Solid', 'Rope', 'Franco', 'Curb', 'Princesa'],
  Earrings: ['Normal', 'Diamond'],
  Necklaces: ['Normal', 'Diamond'],
  Watches: ['Bulova'],
  Pendants: ['Diamond', 'Normal']
};

const getCategoryWithSubcategory = (category, subcategory) => {
  return `${subcategory} ${category}`;
};

const getFilterOptions = () => {
  const filters = [];
  Object.keys(subcategoryOptions).forEach(category => {
    subcategoryOptions[category].forEach(subcategory => {
      filters.push({ text: `${subcategory} ${category}`, value: `${subcategory} ${category}` });
    });
  });
  return filters;
};

const Items = () => {
  const { currentUser, credentialsConfigured } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (credentialsConfigured) {
      fetchItems();
    }
  }, [credentialsConfigured]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await getItems(currentUser.uid);
      const processedItems = response.elements.map(item => {
        const category = item.categories && item.categories.elements && item.categories.elements[0] ? item.categories.elements[0].name : 'N/A';
        const subcategory = item.subcategory || 'N/A';
        const categoryWithSubcategory = category !== 'N/A' && subcategory !== 'N/A' ? getCategoryWithSubcategory(category, subcategory) : category;
        const stockCount = item.itemStock ? item.itemStock.stockCount : 0;
        return {
          ...item,
          categoryWithSubcategory,
          stockCount,
        };
      });
      setItems(processedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      message.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Buscar SKU"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Buscar
          </Button>
        </div>
      ),
      filterIcon: <SearchOutlined />,
      onFilter: (value, record) => record.sku ? record.sku.toLowerCase().includes(value.toLowerCase()) : false,
    },
    {
      title: 'Categoría',
      dataIndex: 'categoryWithSubcategory',
      key: 'categoryWithSubcategory',
      filters: getFilterOptions(),
      onFilter: (value, record) => record.categoryWithSubcategory === value,
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${(price / 100).toFixed(2)}`,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <InputNumber
            placeholder="Buscar Precio"
            value={selectedKeys[0]}
            onChange={value => setSelectedKeys(value ? [value] : [])}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Buscar
          </Button>
        </div>
      ),
      filterIcon: <SearchOutlined />,
      onFilter: (value, record) => record.price / 100 == value,
    },
    {
      title: 'Cantidad en Stock',
      dataIndex: 'stockCount',
      key: 'stockCount',
    },
    {
      title: 'Costo',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => `$${isNaN(cost) ? '0.00' : (cost / 100).toFixed(2)}`,
    },
    {
      title: 'Fecha Modificación',
      dataIndex: 'modifiedTime',
      key: 'modifiedTime',
      render: (time) => moment(time).format('YYYY-MM-DD'),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <RangePicker
            onChange={dates => setSelectedKeys(dates ? [dates] : [])}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Buscar
          </Button>
        </div>
      ),
      filterIcon: <SearchOutlined />,
      onFilter: (value, record) => {
        const [start, end] = value;
        return moment(record.modifiedTime).isBetween(start, end, 'day', '[]');
      },
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginBottom: 16 }}>
        + Agregar Producto
      </Button>
      <Table columns={columns} dataSource={items} loading={loading} rowKey="id" />
      <AddProduct 
        isModalVisible={isModalVisible} 
        setIsModalVisible={setIsModalVisible} 
        fetchItems={fetchItems} 
      />
    </div>
  );
};

export default Items;
