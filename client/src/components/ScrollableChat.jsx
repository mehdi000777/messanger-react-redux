import { useSelector } from "react-redux";
import { selectCurrentUser } from "../app/authSlice";
import { Avatar, Box, Tooltip } from "@chakra-ui/react";

const ScrollableChat = ({ messages }) => {
    const currentUser = useSelector(selectCurrentUser);

    const isSameSender = (messages, m, i, userId) => {
        return (
            i < messages.length - 1 &&
            (messages[i + 1].sender._id !== m.sender._id ||
                messages[i + 1].sender._id === undefined) &&
            messages[i].sender._id !== userId
        );
    }

    const isLastMessage = (messages, i, userId) => {
        return (
            i === messages.length - 1 &&
            messages[messages.length - 1].sender._id !== userId &&
            messages[messages.length - 1].sender._id
        );
    }

    const isSameSenderMargin = (messages, m, i, userId) => {
        if (
            i < messages.length - 1 &&
            messages[i + 1].sender._id === m.sender._id &&
            messages[i].sender._id !== userId
        )
            return 33;
        else if (
            (i < messages.length - 1 &&
                messages[i + 1].sender._id !== m.sender._id &&
                messages[i].sender._id !== userId) ||
            (i === messages.length - 1 && messages[i].sender._id !== userId)
        )
            return 0;
        else return "auto";
    };

    const isSameUser = (messages, m, i) => {
        return i > 0 && messages[i - 1].sender._id === m.sender._id;
    };

    return (
        <Box>
            {messages && messages?.map((message, index) => (
                <Box display='flex' key={message._id}>
                    {
                        (isSameSender(messages, message, index, currentUser._id)
                            || isLastMessage(messages, index, currentUser._id))
                        && (
                            <Tooltip
                                label={message.sender.name}
                                placement="bottom-start"
                                hasArrow
                            >
                                <Avatar
                                    mt='7px'
                                    mr={1}
                                    size='sm'
                                    cursor='pointer'
                                    name={message.sender.name}
                                    src={message.sender.image}
                                />
                            </Tooltip>
                        )
                    }
                    <span
                        style={{
                            backgroundColor: `${message.sender._id === currentUser._id ? "#BEE3F8" : "#B9F5D0"
                                }`,
                            marginLeft: isSameSenderMargin(messages, message, index, currentUser._id),
                            marginTop: isSameUser(messages, message, index, currentUser._id) ? 3 : 10,
                            borderRadius: "20px",
                            padding: "5px 15px",
                            maxWidth: "75%",
                        }}
                    >
                        {message.content}
                    </span>
                </Box>
            ))}
        </Box>
    )
}

export default ScrollableChat;