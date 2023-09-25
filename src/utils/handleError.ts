import type { TRPCClientErrorLike } from "@trpc/client/dist/TRPCClientError";
import type { AnyProcedure } from "@trpc/server/dist/core/procedure";
import { toast } from "react-hot-toast";

export const handleError = (e: unknown) => {
  console.log(e);
  const zodFieldErrors = (
    e as { data?: { zodError?: { fieldErrors?: Record<string, string> } } }
  )?.data?.zodError?.fieldErrors;
  if (zodFieldErrors) {
    for (const [key, value] of Object.entries(zodFieldErrors)) {
      toast.error(`${key}: ${value}`);
    }
  } else if (
    !(e as { data?: { zodError?: unknown } }).data?.zodError &&
    (e as { message?: string }).message
  ) {
    toast.error((e as { message: string }).message);
  } else {
    toast.error("Unable to create game. Please try again.");
  }
  console.error(e);
};
