import type { Metadata } from "next";
import LoginView from "@/components/auth/LoginView";

export const metadata: Metadata = {
  title: "Iniciar sesión — DB Hosting",
  description:
    "Inicia sesión o regístrate con Google o GitHub para aprovisionar tu base de datos SQL Server.",
};

export default function LoginPage() {
  return <LoginView />;
}
