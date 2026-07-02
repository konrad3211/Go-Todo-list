import {
  Box,
  Flex,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../App";
import TodoItem from "./TodoItem";

export type Todo = {
  _id: string;
  body: string;
  completed: boolean;
};

const TodoList = () => {
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const emptyBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const errorBg = useColorModeValue("red.50", "red.900");
  const errorColor = useColorModeValue("red.600", "red.200");

  const {
    data: todos,
    isLoading,
    isError,
    error,
  } = useQuery<Todo[]>({
    queryKey: ["todos"],

    queryFn: async () => {
      const res = await fetch(BASE_URL);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Jeżeli backend zwróci null, zamieniamy go na pustą tablicę.
      return Array.isArray(data) ? data : [];
    },
  });

  // Dodatkowe zabezpieczenie, gdyby todos było undefined lub null.
  const safeTodos = Array.isArray(todos) ? todos : [];

  const activeTodos = safeTodos.filter((todo) => !todo.completed).length;

  const completedTodos = safeTodos.filter((todo) => todo.completed).length;

  if (isLoading) {
    return (
      <Flex justify="center" align="center" py={16}>
        <Spinner size="lg" thickness="4px" color="blue.400" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Box
        border="1px solid"
        borderColor="red.300"
        bg={errorBg}
        borderRadius="xl"
        p={5}
      >
        <Text color={errorColor}>
          {error instanceof Error ? error.message : "Something went wrong"}
        </Text>
      </Box>
    );
  }

  if (safeTodos.length === 0) {
    return (
      <Stack
        align="center"
        spacing={3}
        py={12}
        px={5}
        bg={emptyBg}
        border="1px dashed"
        borderColor={borderColor}
        borderRadius="2xl"
      >
        <Text fontSize="4xl">✓</Text>

        <Text fontSize="xl" fontWeight="700">
          No tasks yet
        </Text>

        <Text color={mutedColor} textAlign="center">
          Add your first task using the form above.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <Flex justify="space-between" align="center">
        <Box>
          <Text fontSize="lg" fontWeight="700">
            Your tasks
          </Text>

          <Text fontSize="sm" color={mutedColor}>
            {activeTodos} active · {completedTodos} completed
          </Text>
        </Box>

        <Text fontSize="sm" color={mutedColor}>
          {safeTodos.length} {safeTodos.length === 1 ? "task" : "tasks"}
        </Text>
      </Flex>

      <Stack spacing={3}>
        {safeTodos.map((todo) => (
          <TodoItem key={todo._id} todo={todo} />
        ))}
      </Stack>
    </Stack>
  );
};

export default TodoList;
