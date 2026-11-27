"use client";

import { useActionState } from "react";
import { AlertCircleIcon, CheckCircle2Icon, PlusIcon } from "lucide-react";
import { tambahRuang, type FormState } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const keadaanAwal: FormState = { ok: false };

export function FormTambahRuang() {
  const [state, aksi, pending] = useActionState(tambahRuang, keadaanAwal);

  // Bila berhasil, kosongkan defaultValue agar form kembali kosong untuk input berikutnya
  const nilai = state.ok ? {} : state.values ?? {};

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          <span>Tambah Ruang</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Ruang</DialogTitle>
          <DialogDescription>
            Masukkan data ruang sekolah yang baru.
          </DialogDescription>
        </DialogHeader>

        {/* noValidate agar validasi panjang nama dan duplikasi tetap ditangani server */}
        <form action={aksi} noValidate className="space-y-4">
          {state.ok && (
            <Alert>
              <CheckCircle2Icon className="text-emerald-700" />
              <AlertDescription className="text-emerald-700">
                Ruang berhasil ditambahkan.
              </AlertDescription>
            </Alert>
          )}

          {!state.ok && state.message && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="nama">Nama Ruang</Label>
            <Input
              id="nama"
              name="nama"
              type="text"
              placeholder="Contoh: Lab Bahasa"
              defaultValue={nilai.nama ?? ""}
              aria-invalid={Boolean(state.errors?.nama)}
              aria-describedby={state.errors?.nama ? "nama-error" : undefined}
            />
            {state.errors?.nama && (
              <p id="nama-error" className="text-sm text-destructive">
                {state.errors.nama}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="jenis">Jenis</Label>
            <select
              id="jenis"
              name="jenis"
              defaultValue={nilai.jenis ?? ""}
              aria-invalid={Boolean(state.errors?.jenis)}
              aria-describedby={state.errors?.jenis ? "jenis-error" : undefined}
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30"
            >
              <option value="">-- Pilih jenis --</option>
              <option value="lab">Laboratorium (lab)</option>
              <option value="kelas">Ruang Kelas (kelas)</option>
              <option value="aula">Aula (aula)</option>
            </select>
            {state.errors?.jenis && (
              <p id="jenis-error" className="text-sm text-destructive">
                {state.errors.jenis}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kapasitas">Kapasitas</Label>
            <Input
              id="kapasitas"
              name="kapasitas"
              type="number"
              min={1}
              placeholder="Contoh: 30"
              defaultValue={nilai.kapasitas ?? ""}
              aria-invalid={Boolean(state.errors?.kapasitas)}
              aria-describedby={
                state.errors?.kapasitas ? "kapasitas-error" : undefined
              }
            />
            {state.errors?.kapasitas && (
              <p id="kapasitas-error" className="text-sm text-destructive">
                {state.errors.kapasitas}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lokasi">Lokasi</Label>
            <Input
              id="lokasi"
              name="lokasi"
              type="text"
              placeholder="Contoh: Gedung A Lantai 2"
              defaultValue={nilai.lokasi ?? ""}
              aria-invalid={Boolean(state.errors?.lokasi)}
              aria-describedby={
                state.errors?.lokasi ? "lokasi-error" : undefined
              }
            />
            {state.errors?.lokasi && (
              <p id="lokasi-error" className="text-sm text-destructive">
                {state.errors.lokasi}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Simpan Ruang"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
