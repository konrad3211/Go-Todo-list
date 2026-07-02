import {
  Box,
  Container,
  Heading,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Navbar from "./components/Navbar";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";

export const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:4000/api/todos"
    : "/api";

const App = () => {
  const headingColor = useColorModeValue("gray.900", "whiteAlpha.900");
  const muted = useColorModeValue("gray.600", "gray.400");
  const bg = useColorModeValue("#F8FAFC", "#0B1120");
  const cardBg = useColorModeValue("white", "#111827");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");

  return (
    <Box minH="100vh" bg={bg} py={{ base: 6, md: 12 }}>
      <Container maxW="660px">
        <Stack
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="3xl"
          boxShadow="2xl"
          p={{ base: 5, md: 8 }}
          spacing={7}
        >
          <Navbar />

          <Box textAlign="center">
            <Heading
              fontSize={{ base: "3xl", md: "4xl" }}
              letterSpacing="-1px"
              color={headingColor}
            >
              Today&apos;s Tasks
            </Heading>

            <Text mt={2} color={muted}>
              Organize your day and finish what matters.
            </Text>
          </Box>

          <TodoForm />
          <TodoList />
        </Stack>
      </Container>
    </Box>
  );
};

export default App;
