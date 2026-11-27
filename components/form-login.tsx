"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const keadaanAwal: FormState = { ok: false };

export function FormLogin() {
  const [state, aksi, pending] = useActionState(login, keadaanAwal);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login Admin</CardTitle>
        <CardDescription>
          Masukkan kata sandi untuk melanjutkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* noValidate agar pemeriksaan kata sandi tetap diproses oleh Server Action */}
        <form action={aksi} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sandi">Kata Sandi</Label>
            {/* Sengaja tanpa defaultValue agar kata sandi tidak pernah diisi ulang */}
            <Input
              id="sandi"
              name="sandi"
              type="password"
              placeholder='Contoh: "Admin123", "321administrator"'
              autoComplete="current-password"
              aria-invalid={Boolean(state.errors?.sandi)}
              aria-describedby={
                state.errors?.sandi ? "sandi-error" : undefined
              }
            />
            {state.errors?.sandi && (
              <p id="sandi-error" className="text-sm text-destructive">
                {state.errors.sandi}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Memeriksa..." : "Masuk"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
