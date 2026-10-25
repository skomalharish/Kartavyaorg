import { createFileRoute } from "@tanstack/react-router";
import { useMe } from "@/components/kartavya";
import { PassportView } from "@/components/passport";

export const Route = createFileRoute("/pro/passport")({ component: P });

function P() {
  const me = useMe();
  return me ? <PassportView w={me} showPrivate /> : null;
}
