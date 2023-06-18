import { ViewIcon } from '@chakra-ui/icons';
import {
    Button,
    IconButton,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure
} from '@chakra-ui/react';

const ProfileModal = ({ user, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <>
            {
                children ? <span onClick={onOpen}>{children}</span> : (
                    <IconButton
                        display={{ base: 'flex' }}
                        icon={<ViewIcon />}
                        onClick={onOpen}
                    />
                )
            }
            <Modal size='lg' isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize='40px'
                        fontFamily='Work sans'
                        display='flex'
                        justifyContent='center'
                    >
                        {user.name}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display='flex' alignItems='center' flexDirection='column'>
                        <Image
                            borderRadius='full'
                            boxSize='150px'
                            src={user?.image}
                            alt={user?.name}
                        />
                        <Text
                            fontSize={{ base: '28px', md: '30px' }}
                            fontFamily='Work sans'
                            mt={5}
                        >
                            Email: {user?.email}
                        </Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default ProfileModal;