import {
  Button,
  Flex,
  Input,
  Spinner,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { BASE_URL } from "../App";

const TodoForm = () => {
  const [newTodo, setNewTodo] = useState("");

  const queryClient = useQueryClient();

  const inputBg = useColorModeValue("white", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.200");

  const { mutate: createTodo, isPending: isCreating } = useMutation({
    mutationKey: ["createTodo"],

    mutationFn: async (body: string) => {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body,
          completed: false,
        }),
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

      setNewTodo("");

      toast.success("Task added");
    },

    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTodo.trim()) return;

    createTodo(newTodo);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex gap={3}>
        <Input
          autoFocus
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="What needs to be done?"
          size="lg"
          bg={inputBg}
          borderColor={borderColor}
          borderRadius="xl"
          _placeholder={{
            color: "gray.500",
          }}
          _focus={{
            borderColor: "blue.400",
            boxShadow: "0 0 0 3px rgba(59,130,246,.15)",
          }}
        />

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          borderRadius="xl"
          minW="56px"
          w="56px"
          h="56px"
          isDisabled={isCreating || !newTodo.trim()}
        >
          {isCreating ? (
            <Spinner size="sm" color="white" />
          ) : (
            <Text fontSize="3xl" color="white" lineHeight="1">
              +
            </Text>
          )}
        </Button>
      </Flex>
    </form>
  );
};

export default TodoForm;
