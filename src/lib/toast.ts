import { toast as sonnerToast } from "sonner";

export const toast = (props: any) => {
  const title = props.title || props.message;
  const description = props.title && props.message ? props.message : undefined;

  const options = description ? { description } : {};

  if (props.variant === "error") {
    sonnerToast.error(title, options);
  } else if (props.variant === "success") {
    sonnerToast.success(title, options);
  } else if (props.variant === "warning") {
    sonnerToast.warning(title, options);
  } else {
    sonnerToast(title, options);
  }
};

toast.success = (message: string) => sonnerToast.success(message);
toast.error = (message: string) => sonnerToast.error(message);
toast.warning = (message: string) => sonnerToast.warning(message);
