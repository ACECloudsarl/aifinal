// pages/admin/bots/index.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  Badge,
  HStack,
  VStack,
  Tooltip,
  useColorModeValue,
  Flex,
  Heading,
  useToast,
  Avatar,
  Tag,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  AddIcon, 
  RepeatIcon, 
  EditIcon, 
  DeleteIcon 
} from '@chakra-ui/icons';
import AdminLayout from '@/components/admin/AdminLayout';
import withAuth from '../../../lib/withAuth';

function AdminBots() {
  const router = useRouter();
  const toast = useToast();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Colors
  const bgTable = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  const fetchBots = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/bots');
      
      if (!response.ok) {
        throw new Error('Failed to fetch bots');
      }
      
      const data = await response.json();
      setBots(data);
    } catch (error) {
      console.error('Error fetching bots:', error);
      setError('Failed to load bots. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBots();
  }, []);
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredBots = bots.filter(bot => 
    bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.model.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleEdit = (botId) => {
    router.push(`/admin/bots/${botId}`);
  };
  
  const confirmDelete = (bot) => {
    setDeleteTarget(bot);
    onOpen();
  };
  
  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      const response = await fetch(`/api/admin/bots/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete bot');
      }
      
      // Remove the deleted bot from the state
      setBots(bots.filter(bot => bot.id !== deleteTarget.id));
      
      toast({
        title: "Bot deleted",
        description: `The bot "${deleteTarget.name}" has been deleted.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting bot:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete bot. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  return (
    <AdminLayout title="Bots Management">
      <Box mb={5}>
        <Flex justify="space-between" wrap="wrap" gap={3} mb={4}>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search bots..."
              value={searchQuery}
              onChange={handleSearch}
              bg={useColorModeValue('white', 'gray.800')}
            />
          </InputGroup>
          
          <HStack spacing={3}>
            <Button 
              leftIcon={<RepeatIcon />}
              variant="outline" 
              onClick={fetchBots}
            >
              Refresh
            </Button>
            
            <Button 
              colorScheme="purple" 
              leftIcon={<AddIcon />}
              onClick={() => router.push('/admin/bots/new')}
            >
              Add Bot
            </Button>
          </HStack>
        </Flex>
        
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
      </Box>
      
      {loading ? (
        <Flex justify="center" align="center" py={10}>
          <VStack spacing={4}>
            <Spinner size="xl" thickness="4px" color="purple.500" />
            <Text>Loading bots...</Text>
          </VStack>
        </Flex>
      ) : (
        <Box
          borderWidth="1px"
          borderStyle="solid"
          borderColor={borderColor}
          borderRadius="md"
          overflow="auto"
          bg={bgTable}
          maxH="calc(100vh - 220px)"
        >
          <Table variant="simple">
            <Thead position="sticky" top={0} bg={bgTable} zIndex={1}>
              <Tr>
                <Th width="50px">#</Th>
                <Th width="250px">Bot</Th>
                <Th>Description</Th>
                <Th width="150px">Category</Th>
                <Th width="250px">Model</Th>
                <Th width="100px" textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredBots.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={8}>
                    <Text fontSize="lg" fontWeight="medium">No bots found</Text>
                    <Text color="gray.500" mt={2}>Try a different search term or add a new bot</Text>
                  </Td>
                </Tr>
              ) : (
                filteredBots.map((bot, index) => (
                  <Tr 
                    key={bot.id}
                    _hover={{ bg: hoverBg }}
                  >
                    <Td>{index + 1}</Td>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar 
                          src={bot.avatar} 
                          name={bot.name}
                          size="md"
                          borderRadius="md"
                        />
                        <Text fontWeight="medium">{bot.name}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Text noOfLines={2} maxW="400px">
                        {bot.description}
                      </Text>
                    </Td>
                    <Td>
                      <Tag colorScheme="purple" variant="subtle">
                        {bot.category}
                      </Tag>
                    </Td>
                    <Td>
                      <Text 
                        fontSize="sm" 
                        fontFamily="mono"
                        color="gray.500"
                        noOfLines={1}
                      >
                        {bot.model}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={2} justify="center">
                        <Tooltip label="Edit bot">
                          <IconButton 
                            colorScheme="blue"
                            variant="outline"
                            size="sm"
                            icon={<EditIcon />}
                            onClick={() => handleEdit(bot.id)}
                            aria-label="Edit bot"
                          />
                        </Tooltip>
                        
                        <Tooltip label="Delete bot">
                          <IconButton 
                            colorScheme="red"
                            variant="outline"
                            size="sm"
                            icon={<DeleteIcon />}
                            onClick={() => confirmDelete(bot)}
                            aria-label="Delete bot"
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {deleteTarget && (
              <>
                <Text>Are you sure you want to delete the following bot?</Text>
                <HStack mt={4} spacing={3} p={3} bg={hoverBg} borderRadius="md">
                  <Avatar 
                    src={deleteTarget.avatar} 
                    name={deleteTarget.name} 
                    size="md"
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{deleteTarget.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {deleteTarget.category}
                    </Text>
                  </VStack>
                </HStack>
                <Text mt={4} color="red.500" fontWeight="medium">
                  This action cannot be undone.
                </Text>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
}

export default withAuth(AdminBots);