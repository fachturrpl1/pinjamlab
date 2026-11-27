"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { ajukanPeminjaman, type FormState } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Textarea } from "@/components/ui/textarea";
import type { Ruang } from "@/data/types";
import { nomorPermohonan } from "@/lib/format";

const keadaanAwal: FormState = { ok: false };

export function FormPinjam({
  daftarRuang,
  ruangAwal,
  minTanggal,
  maksTanggal,
}: {
  daftarRuang: Ruang[];
  ruangAwal: string;
  minTanggal: string;
  maksTanggal: string;
}) {
  const [state, aksi, pending] = useActionState(ajukanPeminjaman, keadaanAwal);

  // Bila pengajuan berhasil, ganti formulir dengan kartu sukses berisi nomor permohonan
  if (state.ok && state.nomor) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2Icon className="size-5" />
            <CardTitle>Permohonan Berhasil Dikirim</CardTitle>
          </div>
          <CardDescription>
            Simpan nomor ini untuk cek status permohonan Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <p className="text-xs text-muted-foreground">Nomor Permohonan</p>
            <p className="mt-1 text-3xl font-bold tracking-wider uppercase">
              {nomorPermohonan(state.nomor)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/cek">Cek Status</Link>
            </Button>
            {/* Pakai <a> agar halaman dimuat ulang dan state formulir kembali kosong */}
            <Button asChild variant="outline">
              <a href="/pinjam">Ajukan lagi</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Peminjaman</CardTitle>
        <CardDescription>
          Isi seluruh kolom di bawah ini dengan benar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* noValidate wajib agar validasi dilakukan di server dengan pesan ramah per kolom */}
        <form action={aksi} noValidate className="space-y-4">
          {!state.ok && state.message && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="ruang_id">Ruang</Label>
            {/* defaultValue diambil dari state.values agar pilihan tidak hilang saat validasi gagal */}
            <select
              id="ruang_id"
              name="ruang_id"
              defaultValue={state.values?.ruang_id ?? ruangAwal}
              aria-invalid={Boolean(state.errors?.ruang_id)}
              aria-describedby={
                state.errors?.ruang_id ? "ruang_id-error" : undefined
              }
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30"
            >
              <option value="">-- Pilih ruang --</option>
              {daftarRuang.map((ruang) => (
                <option key={ruang.id} value={String(ruang.id)}>
                  {ruang.nama} (kapasitas {ruang.kapasitas} orang)
                </option>
              ))}
            </select>
            {state.errors?.ruang_id && (
              <p id="ruang_id-error" className="text-sm text-destructive">
                {state.errors.ruang_id}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tanggal">Tanggal</Label>
            <Input
              id="tanggal"
              name="tanggal"
              type="date"
              min={minTanggal}
              max={maksTanggal}
              defaultValue={state.values?.tanggal ?? ""}
              aria-invalid={Boolean(state.errors?.tanggal)}
              aria-describedby={
                state.errors?.tanggal ? "tanggal-error" : undefined
              }
            />
            {state.errors?.tanggal && (
              <p id="tanggal-error" className="text-sm text-destructive">
                {state.errors.tanggal}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="mulai">Jam Mulai</Label>
              <Input
                id="mulai"
                name="mulai"
                type="time"
                min="07:00"
                max="17:00"
                defaultValue={state.values?.mulai ?? ""}
                aria-invalid={Boolean(state.errors?.mulai)}
                aria-describedby={
                  state.errors?.mulai ? "mulai-error" : undefined
                }
              />
              {state.errors?.mulai && (
                <p id="mulai-error" className="text-sm text-destructive">
                  {state.errors.mulai}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="selesai">Jam Selesai</Label>
              <Input
                id="selesai"
                name="selesai"
                type="time"
                min="07:00"
                max="17:00"
                defaultValue={state.values?.selesai ?? ""}
                aria-invalid={Boolean(state.errors?.selesai)}
                aria-describedby={
                  state.errors?.selesai ? "selesai-error" : undefined
                }
              />
              {state.errors?.selesai && (
                <p id="selesai-error" className="text-sm text-destructive">
                  {state.errors.selesai}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="jumlah_orang">Jumlah Orang</Label>
            <Input
              id="jumlah_orang"
              name="jumlah_orang"
              type="number"
              min={1}
              defaultValue={state.values?.jumlah_orang ?? ""}
              aria-invalid={Boolean(state.errors?.jumlah_orang)}
              aria-describedby={
                state.errors?.jumlah_orang ? "jumlah_orang-error" : undefined
              }
            />
            {state.errors?.jumlah_orang && (
              <p id="jumlah_orang-error" className="text-sm text-destructive">
                {state.errors.jumlah_orang}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="peminjam">Nama Peminjam</Label>
            <Input
              id="peminjam"
              name="peminjam"
              type="text"
              placeholder="Contoh: Andi Pratama"
              defaultValue={state.values?.peminjam ?? ""}
              aria-invalid={Boolean(state.errors?.peminjam)}
              aria-describedby={
                state.errors?.peminjam ? "peminjam-error" : undefined
              }
            />
            {state.errors?.peminjam && (
              <p id="peminjam-error" className="text-sm text-destructive">
                {state.errors.peminjam}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="keperluan">Keperluan</Label>
            <Textarea
              id="keperluan"
              name="keperluan"
              rows={3}
              placeholder="Contoh: Praktikum Pemrograman Web Kelas XI"
              defaultValue={state.values?.keperluan ?? ""}
              aria-invalid={Boolean(state.errors?.keperluan)}
              aria-describedby={
                state.errors?.keperluan ? "keperluan-error" : undefined
              }
            />
            {state.errors?.keperluan && (
              <p id="keperluan-error" className="text-sm text-destructive">
                {state.errors.keperluan}
              </p>
            )}
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Mengirim..." : "Ajukan Peminjaman"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
