"use client";

import { useActionState, useState, useTransition } from "react";
import {
  setujuiPeminjaman,
  tolakPeminjaman,
  type AksiHasil,
  type FormState,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Status } from "@/data/types";

const keadaanAwal: FormState = { ok: false };

export function AksiPermohonan({ id, status }: { id: number; status: Status }) {
  const [pendingSetujui, startTransition] = useTransition();
  const [hasilSetujui, setHasilSetujui] = useState<AksiHasil | null>(null);
  const [stateTolak, aksiTolak, pendingTolak] = useActionState(
    tolakPeminjaman,
    keadaanAwal
  );

  function handleSetujui() {
    startTransition(async () => {
      const hasil = await setujuiPeminjaman(id);
      setHasilSetujui(hasil);
    });
  }

  const pesanHasil =
    hasilSetujui ??
    (stateTolak.ok && stateTolak.message
      ? { ok: true, message: stateTolak.message }
      : null);

  return (
    <div className="space-y-1.5">
      {status === "menunggu" && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={pendingSetujui || pendingTolak}
            onClick={handleSetujui}
          >
            {pendingSetujui ? "Memproses..." : "Setujui"}
          </Button>

          {/* Dialog otomatis tertutup/unmount setelah sukses atau status tak lagi menunggu */}
          {!stateTolak.ok && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={pendingSetujui || pendingTolak}
                >
                  Tolak
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tolak Permohonan</DialogTitle>
                  <DialogDescription>
                    Alasan penolakan akan dilihat oleh peminjam di halaman cek
                    status.
                  </DialogDescription>
                </DialogHeader>
                {/* noValidate agar validasi panjang alasan tetap dilakukan di server */}
                <form action={aksiTolak} noValidate className="space-y-4">
                  <input type="hidden" name="id" value={id} />

                  {!stateTolak.ok && stateTolak.message && (
                    <p className="text-sm text-destructive">
                      {stateTolak.message}
                    </p>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor={`alasan-${id}`}>
                      Alasan penolakan (minimal 5 huruf)
                    </Label>
                    <Textarea
                      id={`alasan-${id}`}
                      name="alasan"
                      rows={3}
                      defaultValue={stateTolak.values?.alasan ?? ""}
                      aria-invalid={Boolean(stateTolak.errors?.alasan)}
                      aria-describedby={
                        stateTolak.errors?.alasan
                          ? `alasan-error-${id}`
                          : undefined
                      }
                    />
                    {stateTolak.errors?.alasan && (
                      <p
                        id={`alasan-error-${id}`}
                        className="text-sm text-destructive"
                      >
                        {stateTolak.errors.alasan}
                      </p>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={pendingTolak}
                    >
                      {pendingTolak ? "Menolak..." : "Tolak Permohonan"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}

      {pesanHasil && (
        <p
          className={
            pesanHasil.ok
              ? "text-xs text-emerald-700"
              : "text-xs text-destructive"
          }
        >
          {pesanHasil.message}
        </p>
      )}
    </div>
  );
}
