"use client";

import {useFormStatus} from "react-dom";
import {BoxComponentProps, BoxProps, Button, ButtonProps} from "@mantine/core";

type Props = ButtonProps & BoxProps & BoxComponentProps & {
  pendingText?: string;
};

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
