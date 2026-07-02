import {
  Badge,
  Flex,
  IconButton,
  Spinner,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaCheck } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import toast from "react-hot-toast";

import { BASE_URL } from "../App";
import type { Todo } from "./TodoList";

const TodoItem = ({ todo }: { todo: Todo }) => {
  const queryClient = useQueryClient();

  const itemBg = useColorModeValue("white", "whiteAlpha.50");
  const itemHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const completedTextColor = useColorModeValue("gray.500", "gray.500");

  const { mutate: updateTodo, isPending: isUpdating } = useMutation({
    mutationKey: ["updateTodo", todo._id],

    mutationFn: async () => {
      if (todo.completed) {
        throw new Error("Todo is already completed");
      }

      const res = await fetch(`${BASE_URL}/${todo._id}`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todos"],
      });

      toast.success("Task completed");
    },

    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    },
  });

  const { mutate: deleteTodo, isPending: isDeleting } = useMutation({
    mutationKey: ["deleteTodo", todo._id],

    mutationFn: async () => {
      const res = await fetch(`${BASE_URL}/${todo._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todos"],
      });

      toast.success("Task deleted");
    },

    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    },
  });

  const isBusy = isUpdating || isDeleting;

  return (
    <Flex
      w="full"
      align="center"
      justify="space-between"
      gap={3}
      bg={itemBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      px={4}
      py={4}
      transition="all 0.2s ease"
      _hover={{
        bg: itemHoverBg,
        borderColor: todo.completed ? "green.400" : "blue.400",
        transform: "translateY(-1px)",
        boxShadow: "md",
      }}
    >
      <Flex minW={0} flex={1} align="center" gap={3}>
        <Flex
          w="34px"
          h="34px"
          minW="34px"
          align="center"
          justify="center"
          borderRadius="full"
          bg={todo.completed ? "green.500" : "transparent"}
          border="2px solid"
          borderColor={todo.completed ? "green.500" : borderColor}
          color="white"
        >
          {todo.completed && <FaCheck size={14} />}
        </Flex>

        <Text
          minW={0}
          flex={1}
          fontSize="md"
          fontWeight="600"
          color={todo.completed ? completedTextColor : textColor}
          textDecoration={todo.completed ? "line-through" : "none"}
          wordBreak="break-word"
        >
          {todo.body}
        </Text>

        <Badge
          colorScheme={todo.completed ? "green" : "blue"}
          borderRadius="full"
          px={2.5}
          py={1}
          fontSize="xs"
          whiteSpace="nowrap"
          flexShrink={0}
        >
          {todo.completed ? "Completed" : "Active"}
        </Badge>
      </Flex>

      <Flex align="center" gap={1} flexShrink={0}>
        {!todo.completed && (
          <IconButton
            aria-label="Complete task"
            title="Complete task"
            icon={isUpdating ? <Spinner size="xs" /> : <FaCheck size={16} />}
            colorScheme="green"
            variant="ghost"
            borderRadius="full"
            isDisabled={isBusy}
            onClick={() => updateTodo()}
          />
        )}

        <IconButton
          aria-label="Delete task"
          title="Delete task"
          icon={
            isDeleting ? <Spinner size="xs" /> : <MdDeleteOutline size={21} />
          }
          colorScheme="red"
          variant="ghost"
          borderRadius="full"
          isDisabled={isBusy}
          onClick={() => deleteTodo()}
        />
      </Flex>
    </Flex>
  );
};

export default TodoItem;
