import type UserRole from "@/types/UserRole.ts";

export interface User {
    id: string
    battletag: string,
    roles: UserRole[],
}
