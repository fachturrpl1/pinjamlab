"use client";

import { useState, useTransition } from "react";
import { hapusRuang, ubahStatusRuang, type AksiHasil } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { TableCell } from "@/components/ui/table";

type HasilSumber = AksiHasil & { sumber: "status" | "hapus" };

export function AksiRuang({ id, aktif }: { id: number; aktif: boolean }) {
  const [pending, startTransition] = useTransition();
  const [bukaHapus, setBukaHapus] = useState(false);
  const [hasil, setHasil] = useState<HasilSumber | null>(null);

  function handleUbahStatus() {
    startTransition(async () => {
      const res = await ubahStatusRuang(id, !aktif);
      setHasil({ sumber: "status", ...res });
    });
  }

  function handleHapus() {
    startTransition(async () => {
      const res = await hapusRuang(id);
      // Pakai langsung pesan ramah dari server (mis. bila ruang pernah dipinjam)
      setHasil({ sumber: "hapus", ...res });
      setBukaHapus(false);
    });
  }

  return (
    <>
      <TableCell>
        <div className="space-y-1">
          <Switch
            checked={aktif}
            disabled={pending}
            onCheckedChange={handleUbahStatus}
            aria-label={aktif ? "Nonaktifkan ruang" : "Aktifkan ruang"}
          />
          {hasil?.sumber === "status" && (
            <p
              className={
                hasil.ok
                  ? "text-xs text-emerald-700"
                  : "text-xs text-destructive"
              }
            >
              {hasil.message}
            </p>
          )}
        </div>
      </TableCell>

      <TableCell className="whitespace-normal">
        <div className="space-y-1">
          <Dialog open={bukaHapus} onOpenChange={setBukaHapus}>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={pending}
              >
                Hapus
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hapus ruang ini?</DialogTitle>
                <DialogDescription>
                  Ruang yang belum pernah dipinjam akan dihapus permanen.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={pending}>
                    Batal
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={pending}
                  onClick={handleHapus}
                >
                  {pending ? "Menghapus..." : "Ya, Hapus"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {hasil?.sumber === "hapus" && (
            <p
              className={
                hasil.ok
                  ? "text-xs text-emerald-700"
                  : "text-xs text-destructive"
              }
            >
              {hasil.message}
            </p>
          )}
        </div>
      </TableCell>
    </>
  );
}
