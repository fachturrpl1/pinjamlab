"use client";

import { useActionState } from "react";
import { AlertCircleIcon } from "lucide-react";
import { cekStatus, type CekState } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import type { Status } from "@/data/types";
import { formatJam, formatTanggal, nomorPermohonan } from "@/lib/format";

const keadaanAwal: CekState = { ok: false };

function badgeStatus(status: Status) {
  if (status === "disetujui") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-200 bg-emerald-100 text-emerald-800"
      >
        Disetujui
      </Badge>
    );
  }
  if (status === "ditolak") {
    return <Badge variant="destructive">Ditolak</Badge>;
  }
  return (
    <Badge
      variant="outline"
      className="border-amber-200 bg-amber-100 text-amber-800"
    >
      Menunggu
    </Badge>
  );
}

export function FormCek() {
  const [state, aksi, pending] = useActionState(cekStatus, keadaanAwal);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cari Permohonan</CardTitle>
          <CardDescription>
            Masukkan nomor permohonan dan nama peminjam yang sama saat
            mengajukan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* noValidate agar seluruh pemeriksaan dan pesan netral ditangani server */}
          <form action={aksi} noValidate className="space-y-4">
            {!state.ok && state.message && (
              // Tampilkan pesan server apa adanya (netral) tanpa membocorkan nomor atau nama yang salah
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="nomor">Nomor Permohonan</Label>
              <Input
                id="nomor"
                name="nomor"
                type="text"
                placeholder="Contoh: PJM-00001"
                defaultValue={state.values?.nomor ?? ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="peminjam">Nama Peminjam</Label>
              <Input
                id="peminjam"
                name="peminjam"
                type="text"
                placeholder="Nama peminjam saat mengajukan"
                defaultValue={state.values?.peminjam ?? ""}
              />
            </div>

            <Button type="submit" disabled={pending}>
              {pending ? "Memeriksa..." : "Cek Status"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {state.ok && state.hasil && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardDescription>Nomor Permohonan</CardDescription>
              <CardTitle className="text-lg">
                {nomorPermohonan(state.hasil.nomor)}
              </CardTitle>
            </div>
            {badgeStatus(state.hasil.status)}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4 border-b pb-2">
              <span className="text-muted-foreground">Ruang</span>
              <span className="font-medium">{state.hasil.ruang}</span>
            </div>
            <div className="flex justify-between gap-4 border-b pb-2">
              <span className="text-muted-foreground">Tanggal</span>
              <span className="font-medium">
                {formatTanggal(state.hasil.tanggal)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Jam</span>
              <span className="font-medium">
                {formatJam(state.hasil.mulai)} -{" "}
                {formatJam(state.hasil.selesai)}
              </span>
            </div>
            {state.hasil.status === "ditolak" && (
              <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive">
                Alasan penolakan: {state.hasil.alasan_tolak ?? "-"}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
