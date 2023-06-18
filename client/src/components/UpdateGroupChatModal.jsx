import { ViewIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    FormControl,
    IconButton,
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
} from "@chakra-ui/react"
import { useEffect, useState } from "react";
import UserBadgeItem from "./UserBadgeItem";
import UserListItem from "./UserListItem";
import { useLazyGetSearchUsersQuery } from "../app/userApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../app/authSlice";
import { useAddUserToGroupMutation, useGetUserChatsQuery, useRemoveUserGroupMutation, useRenameGroupMutation } from "../app/chatApiSlice";

const UpdateGroupChatModal = ({ selectedChat, setSelectedChat }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [name, setName] = useState('');
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const currentUser = useSelector(selectCurrentUser);

    const toast = useToast();

    const { chat } = useGetUserChatsQuery('getUserChats', {
        selectFromResult: ({ data }) => ({
            chat: data?.find(item => item?._id === selectedChat?._id)
        })
    })

    const [getSearchUsers, { isLoading: searchIsLoading }] = useLazyGetSearchUsersQuery();
    const [renameGroup, { isLoading: renameIsLoading }] = useRenameGroupMutation();
    const [addUserToGroup] = useAddUserToGroupMutation();
    const [removeUserGroup] = useRemoveUserGroupMutation();

    useEffect(() => {
        if (!search) return;

        const handleSearch = async () => {
            try {
                const res = await getSearchUsers(search).unwrap();
                setSearchResults(res);
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

    const handleRemove = async (user) => {
        if (selectedChat.groupAdmin._id !== currentUser._id && user._id !== currentUser._id) {
            toast({
                title: "Only admins can remove someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            const res = await removeUserGroup({ user, chatId: selectedChat._id }).unwrap();
            // setSelectedChat(res);
            if (user._id === currentUser._id) {
                setSelectedChat(null);
                onClose();
            }
        } catch (error) {
            toast({
                title: "Remove User Error",
                description: error?.data?.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    }

    const handleRename = async () => {
        if (!name) {
            toast({
                title: 'Please enter name',
                status: 'error',
                position: 'top',
                duration: 5000,
                isClosable: true
            });
            return;
        }

        try {
            const res = await renameGroup({ name, chatId: selectedChat._id }).unwrap();
            // setSelectedChat(res)
        } catch (error) {
            toast({
                title: 'Rename Group Error',
                description: error?.data?.message,
                status: 'error',
                position: 'top-left',
                duration: 5000,
                isClosable: true
            })
        }
    }

    const handleAddUser = async (user) => {
        if (selectedChat.users.find((u) => u._id === user._id)) {
            toast({
                title: "User Already in group!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        if (selectedChat.groupAdmin._id !== currentUser._id) {
            toast({
                title: "Only admins can add someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            const res = await addUserToGroup({ user, chatId: selectedChat._id }).unwrap();
            // setSelectedChat(res);
        } catch (error) {
            toast({
                title: "Add User Error",
                description: error?.data?.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    }

    return (
        <>
            <IconButton display={{ base: 'flex' }} icon={<ViewIcon />} onClick={onOpen} />

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize="35px"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent="center"
                    >
                        {chat?.name}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center">
                        <Box
                            w='100%'
                            display='flex'
                            flexWrap='wrap'
                            justifyContent='flex-start'
                            pb={3}
                        >
                            {chat?.users.map(user => (
                                <UserBadgeItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => handleRemove(user)}
                                />
                            ))}
                        </Box>
                        <FormControl display='flex'>
                            <Input
                                placeholder="Chat Name"
                                mb={3}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Button
                                variant="solid"
                                colorScheme="teal"
                                ml={1}
                                isLoading={renameIsLoading}
                                onClick={handleRename}
                            >
                                Update
                            </Button>
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Add User to group"
                                mb={1}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {searchIsLoading
                                ? (
                                    <Box
                                        display='flex'
                                        justifyContent='center'
                                        w='100%'
                                    >
                                        <Spinner size='lg' />
                                    </Box>
                                )
                                : searchResults.slice(0, 4).map(user => (
                                    <UserListItem
                                        key={user._id}
                                        user={user}
                                        handleFunction={() => handleAddUser(user)}
                                    />
                                ))
                            }
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme='red'
                            onClick={() => handleRemove(currentUser)}
                        >
                            Leave Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default UpdateGroupChatModal;