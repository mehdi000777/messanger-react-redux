import {
    Box,
    Button,
    FormControl,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import { useLazyGetSearchUsersQuery } from '../app/userApiSlice';
import { useCreatGroupMutation } from '../app/chatApiSlice';
import { useEffect, useMemo, useState } from 'react';
import UserListItem from './UserListItem';
import UserBadgeItem from './UserBadgeItem';

const GroupChatModal = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [name, setName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);

    const [getSearchUsers, { isLoading }] = useLazyGetSearchUsersQuery();
    const [creatGroup, { isLoading: creatGroupIsLoading }] = useCreatGroupMutation();

    const toast = useToast();

    useMemo(() => {
        if (!search) return

        const handleSearch = async () => {
            try {
                const res = await getSearchUsers(search).unwrap();
                setSearchResult(res);
            } catch (error) {
                toast({
                    title: 'Search Error',
                    description: error?.data?.message,
                    status: 'error',
                    position: 'top-left',
                    duration: 5000,
                    isClosable: true
                })
            }
        }
        handleSearch();
    }, [search])

    const handleGroup = (user) => {
        if (selectedUsers.find(item => item._id === user._id)) {
            toast({
                title: 'User already added',
                status: 'warning',
                position: 'top',
                duration: 5000,
                isClosable: true
            })
            return;
        }

        setSelectedUsers(prev => [...prev, user]);
    }

    const handleDelete = (user) => {
        const newSelectedUser = selectedUsers.filter(item => item._id !== user._id);

        setSelectedUsers(newSelectedUser);
    }

    const handleSubmit = async () => {
        if (!name || !selectedUsers || selectedUsers.length < 2) {
            toast({
                title: 'Please fill all the fields',
                status: 'error',
                position: 'top',
                duration: 5000,
                isClosable: true
            })
            return;
        }

        try {
            await creatGroup({ name, users: selectedUsers.map(user => user._id) }).unwrap();
            onClose();
            toast({
                title: 'New Group Chat Created!',
                status: 'success',
                position: 'bottom',
                duration: 5000,
                isClosable: true
            })
        } catch (error) {
            toast({
                title: 'Creat Group Error',
                description: error?.data?.message,
                status: 'error',
                position: 'top',
                duration: 5000,
                isClosable: true
            })
        }
    }

    return (
        <>
            <span onClick={onOpen}>{children}</span>
            <Modal size='lg' isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize='40px'
                        fontFamily='Work sans'
                        display='flex'
                        justifyContent='center'
                    >
                        Create Group Chat
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display='flex' alignItems='center' flexDirection='column'>
                        <FormControl>
                            <Input
                                value={name}
                                placeholder='Chat Name'
                                mb={3}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <Input
                                value={search}
                                placeholder='Add Users eg: John,...'
                                mb={3}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </FormControl>
                        <Box
                            display='flex'
                            flexWrap='wrap'
                            w='100%'
                            justifyContent='flex-start'
                        >
                            {selectedUsers.map(user => (
                                <UserBadgeItem
                                    key={user?._id}
                                    user={user}
                                    handleFunction={() => handleDelete(user)}
                                />
                            ))}
                        </Box>
                        {isLoading
                            ? <Spinner />
                            : searchResult?.slice(0, 4).map(user => (
                                <UserListItem
                                    key={user?._id}
                                    user={user}
                                    handleFunction={() => handleGroup(user)}
                                />
                            ))
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button isLoading={creatGroupIsLoading} colorScheme='blue' onClick={handleSubmit}>
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default GroupChatModal;