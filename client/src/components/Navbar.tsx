import {
  Flex,
  IconButton,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaCheck } from "react-icons/fa6";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const logoBg = useColorModeValue("blue.500", "blue.400");
  const buttonBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const buttonHoverBg = useColorModeValue("gray.200", "whiteAlpha.200");

  return (
    <Flex
      align="center"
      justify="space-between"
      pb={5}
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      <Flex align="center" gap={3}>
        <Flex
          w="36px"
          h="36px"
          align="center"
          justify="center"
          borderRadius="lg"
          bg={logoBg}
          color="white"
          boxShadow="sm"
        >
          <FaCheck size={15} />
        </Flex>

        <Text fontSize="xl" fontWeight="800" letterSpacing="-0.5px">
          TodoFlow
        </Text>
      </Flex>

      <IconButton
        aria-label="Toggle color mode"
        title="Toggle color mode"
        icon={
          colorMode === "light" ? <IoMoon size={18} /> : <LuSun size={18} />
        }
        onClick={toggleColorMode}
        variant="ghost"
        bg={buttonBg}
        _hover={{
          bg: buttonHoverBg,
          transform: "rotate(10deg)",
        }}
        borderRadius="lg"
        transition="all 0.2s ease"
      />
    </Flex>
  );
};

export default Navbar;
