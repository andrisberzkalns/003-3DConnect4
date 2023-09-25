import Head from "next/head";
import Link from "next/link";
import React from "react";

import { toast } from "react-hot-toast";
import { api } from "~/utils/api";

import * as z from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Home } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { Turn } from "@prisma/client";
import { useRouter } from "next/router";
import { handleError } from "~/utils/handleError";
import { TRPCClientError } from "@trpc/client";

const formSchema = z.object({
  color: z.enum([Turn.DARK, Turn.LIGHT]),
});

export default function GameCreate() {
  // const { user } = useUser();
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const router = useRouter();

  const { mutate: mutateCreate, isLoading: isCreatingGame } =
    api.game.create.useMutation({
      onSuccess: async (gameId) => {
        toast.success("Game created successfully.");
        if (gameId) {
          await router.push(`/game/${gameId}/lobby`);
        }
      },
      onError: (e) => handleError(e),
    });
  // const createGame = api.game.createGame.useSuspenseQuery({
  //   color: Player.LIGHT,
  // });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      color: Turn.LIGHT,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // createGame.mutate({
    //   color: values.color,
    // });
    console.log(values);
    mutateCreate({ color: values.color });
  }

  // if (!user) return <></>;

  return (
    <>
      <main className="bg-gradient-to-b from-yellow-500 to-orange-900">
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="absolute left-8 top-8">
            <Button
              type="submit"
              className="w-full"
              onClick={() => {
                void router.push("/");
              }}
            >
              <Home className="mr-4" /> Menu
            </Button>
          </div>
          <div className="h-64 w-64">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={Turn.LIGHT}>Light</SelectItem>
                          <SelectItem value={Turn.DARK}>Dark</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Create game
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </>
  );
}
