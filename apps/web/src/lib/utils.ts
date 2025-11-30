// Utility function for className merging
function cn(
  ...inputs: (string | undefined | null | false | Record<string, boolean>)[]
): string {
  return inputs
    .map((input) => {
      if (typeof input === "object" && input !== null) {
        return Object.entries(input)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(" ");
      }
      return input;
    })
    .filter(Boolean)
    .join(" ");
}

export { cn };
