import React, { useState, useEffect } from 'react';
import { Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Input, Button, Select, useToast } from '@chakra-ui/react';
import axiosInstance from '../../api/axiosInstance';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]); // Novo estado para armazenar usuários
  const { t } = useTranslation();

  // State para o formulário de usuário
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'owner',
  });

  // State para o formulário de restaurante
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    website: '',
    owner_id: '',
  });

  // Efeito para carregar usuários quando o componente é montado
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/users');
        setUsers(response.data);
      } catch (error) {
        toast({
          title: t('admin_dashboard.error_loading_users_title'),
          description: error.response?.data?.error || t('admin_dashboard.error_loading_users_description'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchUsers();
  }, [toast]); // Dependência do toast para evitar loop infinito

  const handleUserChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleRestaurantChange = (e) => {
    setRestaurantForm({ ...restaurantForm, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/admin/users', userForm);
      toast({
        title: t('admin_dashboard.user_created_title'),
        description: t('admin_dashboard.user_created_description'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setUserForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'owner',
      });
    } catch (error) {
      toast({
        title: t('admin_dashboard.error_creating_user_title'),
        description: error.response?.data?.error || t('admin_dashboard.error_creating_user_description'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/admin/restaurants', restaurantForm);
      toast({
        title: t('admin_dashboard.restaurant_created_title'),
        description: t('admin_dashboard.restaurant_created_description'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setRestaurantForm({
        name: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        phone: '',
        email: '',
        website: '',
        owner_id: '',
      });
    } catch (error) {
      toast({
        title: t('admin_dashboard.error_creating_restaurant_title'),
        description: error.response?.data?.error || t('admin_dashboard.error_creating_restaurant_description'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Heading as="h1" size="xl" mb={6}>{t('admin_dashboard.title')}</Heading>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>{t('admin_dashboard.create_user_tab')}</Tab>
          <Tab>{t('admin_dashboard.create_restaurant_tab')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box as="form" onSubmit={handleCreateUser}>
              <FormControl id="name" mb={4} isRequired>
                <FormLabel>{t('admin_dashboard.name_label')}</FormLabel>
                <Input type="text" name="name" value={userForm.name} onChange={handleUserChange} />
              </FormControl>
              <FormControl id="email" mb={4} isRequired>
                <FormLabel>{t('admin_dashboard.email_label')}</FormLabel>
                <Input type="email" name="email" value={userForm.email} onChange={handleUserChange} />
              </FormControl>
              <FormControl id="password" mb={4} isRequired>
                <FormLabel>{t('admin_dashboard.password_label')}</FormLabel>
                <Input type="password" name="password" value={userForm.password} onChange={handleUserChange} />
              </FormControl>
              <FormControl id="phone" mb={4}>
                <FormLabel>{t('admin_dashboard.user_phone_label')}</FormLabel>
                <Input type="text" name="phone" value={userForm.phone} onChange={handleUserChange} />
              </FormControl>
              <FormControl id="role" mb={4} isRequired>
                <FormLabel>{t('admin_dashboard.role_label')}</FormLabel>
                <Select name="role" value={userForm.role} onChange={handleUserChange}>
                  <option value="owner">{t('admin_dashboard.role_owner')}</option>
                  <option value="admin">{t('admin_dashboard.role_admin')}</option>
                  <option value="employee">{t('admin_dashboard.role_employee')}</option>
                </Select>
              </FormControl>
              <Button type="submit" colorScheme="blue">{t('admin_dashboard.create_user_button')}</Button>
            </Box>
          </TabPanel>
          <TabPanel>
            <Box as="form" onSubmit={handleCreateRestaurant}>
              <FormControl id="restaurantName" mb={4} isRequired>
                <FormLabel>{t('admin_dashboard.restaurant_name_label')}</FormLabel>
                <Input type="text" name="name" value={restaurantForm.name} onChange={handleRestaurantChange} />
              </FormControl>
              <FormControl id="owner_id" mb={4} isRequired>
                <FormLabel>{t('admin_dashboard.owner_label')}</FormLabel>
                <Select name="owner_id" value={restaurantForm.owner_id} onChange={handleRestaurantChange} placeholder={t('admin_dashboard.select_owner_placeholder')}>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl id="address" mb={4}>
                <FormLabel>{t('admin_dashboard.address_label')}</FormLabel>
                <Input type="text" name="address" value={restaurantForm.address} onChange={handleRestaurantChange} />
              </FormControl>
              <FormControl id="city" mb={4}>
                <FormLabel>{t('admin_dashboard.city_label')}</FormLabel>
                <Input type="text" name="city" value={restaurantForm.city} onChange={handleRestaurantChange} />
              </FormControl>
              <FormControl id="state" mb={4}>
                <FormLabel>{t('admin_dashboard.state_label')}</FormLabel>
                <Input type="text" name="state" value={restaurantForm.state} onChange={handleRestaurantChange} />
              </FormControl>
              <FormControl id="zip_code" mb={4}>
                <FormLabel>{t('admin_dashboard.zip_code_label')}</FormLabel>
                <Input type="text" name="zip_code" value={restaurantForm.zip_code} onChange={handleRestaurantChange} />
              </FormControl>
              <FormControl id="phone" mb={4}>
                <FormLabel>{t('admin_dashboard.restaurant_phone_label')}</FormLabel>
                <Input type="text" name="phone" value={restaurantForm.phone} onChange={handleRestaurantChange} />
              </FormControl>
              <FormControl id="email" mb={4}>
                <FormLabel>{t('admin_dashboard.restaurant_email_label')}</FormLabel>
                <Input type="email" name="email" value={restaurantForm.email} onChange={handleRestaurantChange} />
              </FormControl>
              <FormControl id="website" mb={4}>
                <FormLabel>{t('admin_dashboard.website_label')}</FormLabel>
                <Input type="text" name="website" value={restaurantForm.website} onChange={handleRestaurantChange} />
              </FormControl>
              <Button type="submit" colorScheme="blue">{t('admin_dashboard.create_restaurant_button')}</Button>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdminDashboard;
