// src/features/identity/components/identity-card.tsx
"use client";

import { useTransition } from "react";
import { LogOut, User, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserIdentity } from "../types";
import { IdentityField } from "./identity-field";

interface IdentityCardProps {
  identity: UserIdentity;
}

/**
 * Mobile-first identity display card.
 * Uses atomic IdentityField components for data rows.
 */
export function IdentityCard({ identity }: IdentityCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      window.location.href = identity.logoutUrl;
    });
  };

  return (
    <Card className="w-full max-w-md border-slate-200 shadow-xl overflow-hidden">
      <CardHeader className="bg-slate-900 text-white p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-full border border-blue-400/30">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <CardTitle className="text-lg font-bold tracking-tight">Active Session</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            disabled={isPending}
            className="text-white hover:bg-red-500/20 hover:text-red-400"
          >
            {isPending ? "..." : <LogOut className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <IdentityField label="Display Name" value={identity.username} />
          <IdentityField label="Email Address" value={identity.email} />
        </div>

        <div className="pt-2">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Access Groups
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {identity.groups.map((group) => (
              <Badge 
                key={group} 
                variant="outline" 
                className="px-3 py-1 bg-white border-slate-200 text-slate-600 font-medium"
              >
                {group}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}