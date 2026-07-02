// components/AppSidebar.tsx
import {
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/shared/components/ui/Sidebar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

export function AppSidebar() {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  return (
    <>
      <SidebarTrigger onPress={() => setOpen(true)}>
        <Ionicons name="menu" size={24} />
      </SidebarTrigger>

      <Sidebar open={open} onOpenChange={setOpen}>
        <SidebarContent>
          <SidebarSeparator />

          <SidebarGroup label="Cuenta">
            <SidebarMenuItem
              label="Perfil"
              icon={
                <Ionicons name="person-outline" size={18} color="#0f172a" />
              }
              onPress={() => router.push("/profile")}
            />
          </SidebarGroup>

          <SidebarGroup label="Organización">
            <SidebarMenuItem
              label="Organización"
              icon={
                <Ionicons name="person-outline" size={18} color="#0f172a" />
              }
              onPress={() => router.push("/(organization)")}
            />
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenuItem
            label="Cerrar sesión"
            icon={<Ionicons name="log-out-outline" size={18} color="#dc2626" />}
            onPress={() => {}}
          />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
