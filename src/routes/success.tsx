import { createFileRoute } from '@tanstack/react-router'
import {SuccessPage} from "@/pages/SuccessPage.tsx";

export const Route = createFileRoute('/success')({
  component: SuccessPage,
})
