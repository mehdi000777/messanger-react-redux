import {
    Box,
    Button,
    Tooltip,
    Text,
    Menu,
    MenuButton,
    Avatar,
    MenuList,
    MenuItem,
    MenuDivider,
    useToast,
    useDisclosure,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    Input,
    Spinner
} from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '../app/authSlice';
import ProfileModal from './ProfileModal';
import { useSendLogOutMutation } from '../app/authApiSlice';
import { useNavigate } from 'react-router-dom';
import { useLazyGetSearchUsersQuery } from '../app/userApiSlice';
import ChatLoading from './ChatLoading';
import UserListItem from './UserListItem';
import { useAccessChatMutation } from '../app/chatApiSlice';
import useGetSender from '../hooks/useGetSender';
import { removeNotification } from '../app/notificationSlice';
import NotificationBadge, { Effect } from 'react-notification-badge'

const SideDrawer = ({ setSelectedChat }) => {
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure()

    const currentUser = useSelector(selectCurrentUser);
    const notifications = useSelector(state => state.notifications);

    const dispatch = useDispatch();

    const toast = useToast();
    const navigate = useNavigate();
    const { sender } = useGetSender();

    const [logout, { isLoading: logoutIsLoading }] = useSendLogOutMutation();
    const [getSearchUsers] = useLazyGetSearchUsersQuery();
    const [accessChat, { isLoading: chatIsLoading }] = useAccessChatMutation();

    const logoutHandler = async () => {
        try {
            const res = await logout().unwrap();
            toast({
                title: res.message,
                status: 'success',
                position: 'bottom',
                duration: 5000,
                isClosable: true
            })
            navigate('/');
        } catch (error) {
            toast({
                title: 'Logout Error',
                description: error?.data?.message,
                status: 'error',
                position: 'bottom',
                duration: 5000,
                isClosable: true
            })
        }
    }

    const handleSearch = async () => {
        if (!search) {
            toast({
                title: 'Please enter something in search',
                status: 'error',
                position: 'top-left',
                duration: 5000,
                isClosable: true
            })
            return;
        }

        try {
            setIsLoading(true)
            const res = await getSearchUsers(search).unwrap();
            setSearchResult(res);
            setIsLoading(false)
        } catch (error) {
            toast({
                title: 'Search Error',
                description: error?.data?.message,
                status: 'error',
                position: 'top-left',
                duration: 5000,
                isClosable: true
            })
            setIsLoading(false)
        }
    }

    const accessChatHandler = async (userId) => {
        try {
            const res = await accessChat(userId).unwrap();
            setSelectedChat(res);
            onClose();
        } catch (error) {
            toast({
                title: 'Chat Error',
                description: error?.data?.message,
                status: 'error',
                position: 'top-left',
                duration: 5000,
                isClosable: true
            })
        }
    }

    if (logoutIsLoading) return <div>Loading...</div>

    return (
        <div>
            <Box
                display='flex'
                justifyContent='space-between'
                alignItems='center'
                bg='white'
                w='100%'
                p='5px 10px 5px 10px'
                borderWidth='5px'
            >
                <Tooltip
                    label="Search users to chat"
                    hasArrow
                    placement='bottom-end'
                >
                    <Button variant='ghost' onClick={onOpen}>
                        <i className='fas fa-search'></i>
                        <Text display={{ base: 'none', md: 'flex' }} px={4}>
                            Search User
                        </Text>
                    </Button>
                </Tooltip>

                <Text fontSize='2xl' fontFamily='Work sans'>
                    Messanger
                </Text>

                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge
                                count={notifications.length}
                                effect={Effect.SCALE}
                            />
                            <BellIcon fontSize='2xl' m={1} />
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notifications.length && 'No New Message'}
                            {notifications.map(notif => (
                                <MenuItem
                                    key={notif?._id}
                                    onClick={() => {
                                        setSelectedChat(notif.chat);
                                        dispatch(removeNotification(notif._id))
                                    }}
                                >
                                    {
                                        notif?.chat?.isGroup
                                            ? `New Message in ${notif?.chat?.name}`
                                            : `New Message from ${sender(notif?.chat?.users).name}`
                                    }
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar
                                size='sm'
                                cursor='pointer'
                                name={currentUser?.name}
                                src={currentUser?.image}
                            />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={currentUser}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>

            <Drawer
                placement='left'
                onClose={onClose}
                isOpen={isOpen}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth='1px'>
                        Search Users
                    </DrawerHeader>
                    <DrawerBody>
                        <Box display='flex' pb={2}>
                            <Input
                                placeholder='Search by name or email'
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button
                                onClick={handleSearch}
                                isLoading={isLoading}
                            >
                                Go
                            </Button>
                        </Box>
                        {isLoading
                            ? <ChatLoading />
                            : searchResult?.map(user => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => accessChatHandler(user._id)}
                                />
                            ))
                        }
                        {chatIsLoading && <Spinner ml='auto' display='flex' />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </div>
    )
}

export default SideDrawer;