import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Table, message, DatePicker, Input, InputNumber, Button, Drawer } from 'antd';
import { SearchOutlined, MenuOutlined } from '@ant-design/icons';
import { getItems } from '../services/api';
import moment from 'moment';
import './Items.css';
import { useAuth } from '../contexts/AuthContext';
import AddProduct from './AddProduct';
import { useInView } from 'react-intersection-observer';

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
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 100;

  const isFetchingRef = useRef(false);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  const fetchItems = useCallback(async (reset = false) => {
    if (isFetchingRef.current || !hasMore || !credentialsConfigured) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const currentOffset = reset ? 0 : offset;
      const newItems = await getItems(currentUser.uid, pageSize, currentOffset);
      if (newItems.length < pageSize) {
        setHasMore(false);
      }
      setItems(prevItems => reset ? newItems : [...prevItems, ...newItems]);
      setOffset(currentOffset + pageSize);
    } catch (error) {
      console.error('Error fetching items:', error);
      message.error('Error al cargar los productos');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [currentUser.uid, offset, pageSize, hasMore, credentialsConfigured]);

  useEffect(() => {
    if (credentialsConfigured && items.length === 0) {
      fetchItems(true);
    }
  }, [credentialsConfigured, fetchItems, items.length]);

  useEffect(() => {
    if (inView && hasMore && !isFetchingRef.current) {
      fetchItems();
    }
  }, [inView, hasMore, fetchItems]);

  const columns = [
    {
      title: 'Quantity',
      dataIndex: 'stockCount',
      key: 'stockCount',
    },
    {
      title: 'Name',
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
      title: 'Category',
      dataIndex: 'subcategory',
      key: 'subcategory',
      filters: getFilterOptions(),
      onFilter: (value, record) => record.subcategory === value,
    },
    {
      title: 'Price',
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
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => `$${isNaN(cost) ? '0.00' : (cost / 100).toFixed(2)}`,
    },
    {
      title: 'Modification Date',
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

  const handleAddProduct = () => {
    setIsModalVisible(true);
  };

  const handleProductAdded = () => {
    setOffset(0);
    setHasMore(true);
    isFetchingRef.current = false;
    fetchItems(true);
  };

  return (
    <div>
      <Button type="primary" onClick={handleAddProduct} className="add-product-btn">
        + Agregar Producto
      </Button>
      <div className="table-container">
        <Table
          columns={columns}
          dataSource={items}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
        {hasMore && <div ref={ref} style={{ height: 20, margin: '20px 0' }} />}
        {!hasMore && <div style={{ textAlign: 'center', margin: '20px 0' }}>No hay más productos</div>}
      </div>
      <AddProduct 
        isModalVisible={isModalVisible} 
        setIsModalVisible={setIsModalVisible} 
        fetchItems={handleProductAdded} 
      />
    </div>
  );
};

export default Items;
