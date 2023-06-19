import { ArrowBackIcon } from "@chakra-ui/icons";
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from "@chakra-ui/react"
import useGetSender from "../hooks/useGetSender";
import ProfileModal from "./ProfileModal";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import { useGetUserChatsQuery } from "../app/chatApiSlice";
import { useEffect, useMemo, useState } from "react";
import { useLazyGetMessagesQuery, useSendMessageMutation } from "../app/messageApiSlice";
import ScrollableChat from "./ScrollableChat";
import io from 'socket.io-client';
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from "../app/authSlice";
import { messageApiSlice } from "../app/messageApiSlice";
import Lottie from 'react-lottie';
import animationData from '../animations/typing.json';
import { addNotification } from "../app/notificationSlice";

const SingleChat = ({ selectedChat, setSelectedChat }) => {
    const { sender } = useGetSender();

    const dispatch = useDispatch();

    const currentUser = useSelector(selectCurrentUser);
    const notifications = useSelector(state => state.notifications);

    let socket;

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    useEffect(() => {
        socket = io(import.meta.env.VITE_BASE_URL);
        socket.emit('setup', currentUser);
        socket.on('connected', () => setSocketConnected(true))
        socket.on('typing', () => setIsTyping(true));
        socket.on('stop typing', () => setIsTyping(false));
    })

    const { chat } = useGetUserChatsQuery('getUserChats', {
        selectFromResult: ({ data }) => ({
            chat: data?.find(item => item?._id === selectedChat?._id)
        })
    })

    const otherUser = useMemo(() => {
        return chat?.users?.filter(user => user?._id !== currentUser?._id).map(item => item?._id);
    }, [currentUser, chat])

    const [sendMessage] = useSendMessageMutation();
    const [getMessages, { data: messages, isLoading, originalArgs }] = useLazyGetMessagesQuery();

    const [newMessage, setNewMessage] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const toast = useToast();

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            await getMessages(chat._id);
            socket?.emit('join chat', chat._id);
        } catch (error) {
            toast({
                title: 'Get Message Error',
                description: error?.data?.message,
                status: 'error',
                position: 'bottom',
                isClosable: true
            })
        }
    }

    useEffect(() => {
        fetchMessages();
    }, [selectedChat])

    const sendMessageHandler = async (e) => {
        if (e.key === 'Enter' && newMessage) {
            try {
                socket.emit('stop typing', otherUser);
                setNewMessage('');
                const res = await sendMessage({ content: newMessage, chatId: chat._id, originalArgs });
                socket.emit('new message', res?.data);
            } catch (error) {
                toast({
                    title: 'Send Message Error',
                    description: error?.data?.message,
                    status: 'error',
                    position: 'bottom',
                    isClosable: true
                })
            }
        }
    }

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit('typing', otherUser);
        }

        const lastTypingTime = new Date().getTime();
        const timerLength = 3000;

        setTimeout(() => {
            const timeNow = new Date().getTime();
            const timeDeff = timeNow - lastTypingTime;

            if (timeDeff >= timerLength && typing) {
                socket.emit('stop typing', otherUser);
                setTyping(false);
            }
        }, timerLength);
    }

    useEffect(() => {
        socket.on('message recieved', newMessageRecieved => {
            if (!chat || chat?._id !== newMessageRecieved?.chat?._id) {
                if (!notifications.includes(newMessageRecieved)) {
                    dispatch(addNotification(newMessageRecieved))
                }
            } else {
                dispatch(
                    messageApiSlice.util.updateQueryData('getMessages', originalArgs, draft => {
                        draft.push(newMessageRecieved);
                    })
                )
            }
        })
    })


    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        w="100%"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent={{ base: "space-between" }}
                        alignItems="center"
                    >
                        <IconButton
                            display={{ base: "flex", md: "none" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat("")}
                        />
                        {!selectedChat.isGroup
                            ? <>
                                {sender(selectedChat.users).name}
                                <ProfileModal user={sender(selectedChat.users)} />
                            </>
                            : (
                                <>
                                    {chat?.name.toUpperCase()}
                                    < UpdateGroupChatModal
                                        selectedChat={selectedChat}
                                        setSelectedChat={setSelectedChat}
                                    />
                                </>
                            )
                        }
                    </Text>
                    <Box
                        display="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="#E8E8E8"
                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        {isLoading
                            ? <Spinner
                                size='xl'
                                w='20'
                                h='20'
                                alignSelf='center'
                                margin='auto'
                            />
                            : (
                                <Box
                                    display='flex'
                                    flexDirection='column'
                                    overflow='auto'
                                    scrollbar-width='none'
                                >
                                    <ScrollableChat messages={messages} />
                                </Box>
                            )
                        }

                        <FormControl
                            onKeyDown={sendMessageHandler}
                            isRequired
                            mt={3}
                        >
                            {isTyping
                                ? <div>
                                    <Lottie
                                        options={defaultOptions}
                                        width={70}
                                        style={{ marginBottom: 15, marginLeft: 0 }}
                                    />
                                </div>
                                : <></>
                            }
                            <Input
                                variant='filled'
                                bg='#E0E0E0'
                                placeholder="Enter a message"
                                onChange={typingHandler}
                                value={newMessage}
                            />
                        </FormControl>
                    </Box>
                </>
            ) : (
                <Box
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    h='100%'
                >
                    <Text
                        fontSize='3xl'
                        pb={3}
                        fontFamily='Work sans'
                    >
                        Click on a user to start chatting
                    </Text>
                </Box>
            )}
        </>
    )
}

export default SingleChat;