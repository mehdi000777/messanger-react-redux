import { useGetUserChatsQuery } from '../app/chatApiSlice';
import { Box, Button, Spinner, Stack, Text, useToast } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';
import GroupChatModal from './GroupChatModal';
import useGetSender from '../hooks/useGetSender';

const MyChats = ({ selectedChat, setSelectedChat }) => {
  const { data: chats, isLoading, isError, error } = useGetUserChatsQuery('getUserChats');

  const toast = useToast();

  const { sender } = useGetSender();

  if (isError) return toast({
    title: 'Data Fetch',
    description: error?.data?.message,
    status: 'error',
    duration: 5000,
    isClosable: true
  })

  return (
    <Box
      display={{ base: selectedChat ? 'none' : 'flex', md: 'flex' }}
      flexDir='column'
      alignItems='center'
      p={3}
      bg='white'
      w={{ base: '100%', md: '31%' }}
      borderRadius='lg'
      borderWidth='1px'
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {!isLoading
          ? (
            <Stack overflowY='auto'>
              {chats?.map(chat => (
                <Box
                  key={chat?._id}
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                  color={selectedChat === chat ? "white" : "black"}
                  px={3}
                  py={2}
                  borderRadius="lg"
                >
                  <Text>
                    {!chat?.isGroup
                      ? sender(chat?.users)?.name
                      : chat?.name}
                  </Text>
                  {chat?.latestMessage && (
                    <Text fontSize="xs">
                      <b>{chat?.latestMessage.sender.name} : </b>
                      {chat?.latestMessage.content.length > 50
                        ? chat?.latestMessage.content.substring(0, 51) + "..."
                        : chat?.latestMessage.content}
                    </Text>
                  )}
                </Box>
              ))}
            </Stack>
          )
          : <ChatLoading />
        }
      </Box>
    </Box>
  )
}

export default MyChats;