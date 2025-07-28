import React, { useState, useEffect } from 'react';
import { Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Input, Button, Select, useToast } from '@chakra-ui/react';
import axiosInstance from '../../api/axiosInstance';

const AdminDashboard = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]); // Novo estado para armazenar usuários

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
        const response = await axiosInstance.get('/admin/users');
        setUsers(response.data);
      } catch (error) {
        toast({
          title: 'Erro ao carregar usuários.',
          description: error.response?.data?.error || 'Ocorreu um erro ao buscar usuários.',
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
      await axiosInstance.post('/admin/users', userForm);
      toast({
        title: 'Usuário criado.',
        description: "Novo usuário criado com sucesso.",
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
        title: 'Erro ao criar usuário.',
        description: error.response?.data?.error || 'Ocorreu um erro.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/admin/restaurants', restaurantForm);
      toast({
        title: 'Restaurante criado.',
        description: "Novo restaurante criado com sucesso.",
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
        title: 'Erro ao criar restaurante.',
        description: error.response?.data?.error || 'Ocorreu um erro.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Heading as="h1" size="xl" mb={6}>Dashboard de Administração</Heading>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Criar Usuário</Tab>
          <Tab>Criar Restaurante</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box as="form" onSubmit={handleCreateUser}>
              <FormControl id="name" mb={4} isRequired>
                <FormLabel>Nome</FormLabel>
                <Input type="text" name="name" value={userForm.name} onChange={handleUserChange} />
              </FormControl>
              <FormControl id="email" mb={4} isRequired>
                <FormLabel>Email</FormLabel>
                <Input type="email" name="email" value={userForm.email} onChange={handleUserChange} />
              </FormControl>
              <FormControl id="password" mb={4} isRequired>
                <FormLabel>Senha</FormLabel>
                <Input type="password" name="password" value={userForm.password} onChange={handleUserChange} />
              </FormControl>
              <FormControl id="phone" mb={4}>
                <FormLabel>Telefone</FormLabel>
                <Input type="text" name="phone" value={userForm.phone} onChange={handleUserChange} />
              </FormControl>
              <FormControl id="role" mb={4} isRequired>
                <FormLabel>Papel</FormLabel>
                <Select name="role" value={userForm.role} onChange={handleUserChange}>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="employee">Employee</option>
                </Select>
              </FormControl>
              <Button type="submit" colorScheme="blue">Criar Usuário</Button>
            </Box>
          </TabPanel>
          <TabPanel>
            <Box as="form" onSubmit={handleCreateRestaurant}>
              <FormControl id="restaurantName" mb={4} isRequired>
                <FormLabel>Nome do Restaurante</FormLabel>
                <Input type="text" name="name" value={restaurantForm.name} onChange={handleRestaurantChange} />
              </FormControl>
              <FormControl id="owner_id" mb={4} isRequired>
                <FormLabel>Proprietário</FormLabel>
                <Select name="owner_id" value={restaurantForm.owner_id} onChange={handleRestaurantChange} placeholder="Selecione um proprietário">
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl id="address" mb={4}>
                <FormLabel>Endereço</FormLabel>
                <Input type="text" name="address" value={restaurantForm.address} onChange={handleRestaurantChange} />
              </FormControl>
              <FormControl id="city" mb={4}>
                <FormLabel>Cidade</FormLabel>
                <Input type="text" name="city" value={restaurantForm.city} onChange={handleRestaurantChange} />
              </FormControl>
              <FormControl id="state" mb={4}>
                <FormLabel>Estado</FormLabel>
                <Input type="text" name="state" value={restaurantForm.state} onChange={handleRestaurantChange} />
              </FormControl>
              <FormControl id="zip_code" mb={4}>
                <FormLabel>CEP</FormLabel>
                <Input type="text" name="zip_code" value={restaurantForm.zip_code} onChange={handleRestaurantChange} />
              </FormControl>
              <FormControl id="phone" mb={4}>
                <FormLabel>Telefone</FormLabel>
                <Input type="text" name="phone" value={restaurantForm.phone} onChange={handleRestaurantChange} />
              </FormControl>
              <FormControl id="email" mb={4}>
                <FormLabel>Email do Restaurante</FormLabel>
                <Input type="email" name="email" value={restaurantForm.email} onChange={handleRestaurantChange} />
              </FormControl>
              <FormControl id="website" mb={4}>
                <FormLabel>Website</FormLabel>
                <Input type="text" name="website" value={restaurantForm.website} onChange={handleRestaurantChange} />
              </FormControl>
              <Button type="submit" colorScheme="blue">Criar Restaurante</Button>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdminDashboard;
