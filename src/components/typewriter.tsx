"use client";

import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import Typewriter from "typewriter-effect/dist/core";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormField,
  FormItem,
  FormControl,
  FormDescription,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TypeWriter = () => {
  const inputFormRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const typewriter: typeof Typewriter | null = null;

    if (inputFormRef.current) {
      const customNodeCreator = function (character: string) {
        if (inputFormRef.current) {
          inputFormRef.current!.placeholder += character;
        }
        return null;
      };

      const onRemoveNode = function () {
        if (inputFormRef.current) {
          inputFormRef.current!.placeholder =
            inputFormRef.current!.placeholder.slice(0, -1);
        }
      };

      const typewriter = new Typewriter(null, {
        loop: true,
        delay: 20,
        deleteSpeed: 20,
        onCreateTextNode: customNodeCreator,
        onRemoveNode: onRemoveNode,
      });

      typewriter
        .typeString("Generate an image of Solar System?")
        .pauseFor(1000)
        .deleteAll(20)
        .typeString("Generate an image of book Shelf?")
        .pauseFor(1000)
        .start();
    }

    return () => {
      if (typewriter) {
        typewriter.stop();
      }
    };
  }, []);

  const promptSchema = z.object({
    prompt: z.string(),
  });

  const form = useForm<z.infer<typeof promptSchema>>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof promptSchema>) => {
    toast.info(data.prompt);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
        method="post"
      >
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm" htmlFor="prompt">
                Prompt
              </FormLabel>
              <FormControl>
                <div className="flex items-center p-2 bg-input/60 text-foreground rounded-md">
                  <Input
                    type="text"
                    id="prompt"
                    placeholder=""
                    className="border-none bg-transparent w-full shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    {...field}
                    ref={inputFormRef}
                  />
                  <Button className="text-sm py-3" type="submit">
                    Generate
                  </Button>
                </div>
              </FormControl>
              <FormDescription className="text-xs">
                Write a prompt for the AI to generate beautiful Images.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default TypeWriter;
