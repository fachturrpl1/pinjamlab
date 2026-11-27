import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPinIcon, UsersIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ambilJadwalDisetujui, ambilRuangById } from "@/lib/data";
import { formatJam, formatTanggal, ikonJenis, labelJenis } from "@/lib/format";

export default async function DetailRuangPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;

  // Validasi ID di awal: hanya terima bilangan bulat positif yang aman bagi JS & BIGINT
  // agar input tidak valid seperti "abc", "0", atau angka raksasa tidak sampai ke database.
  if (!/^\d+$/.test(idParam)) {
    notFound();
  }
  const id = Number(idParam);
  if (!Number.isSafeInteger(id) || id <= 0) {
    notFound();
  }

  const ruang = await ambilRuangById(id);
  if (!ruang) {
    notFound();
  }

  const daftarJadwal = await ambilJadwalDisetujui(ruang.id);
  const Ikon = ikonJenis[ruang.jenis];

  return (
    <>
      <SiteHeader judul="Detail Ruang" />
      <div className="space-y-6 p-4 lg:p-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Ikon className="size-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl">{ruang.nama}</CardTitle>
                  <Badge variant={ruang.aktif ? "default" : "secondary"}>
                    {ruang.aktif ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {labelJenis[ruang.jenis]}
                </p>
              </div>
            </div>

            {ruang.aktif && (
              <Button asChild>
                <Link href={`/pinjam?ruang=${ruang.id}`}>
                  Ajukan peminjaman ruang ini
                </Link>
              </Button>
            )}
          </CardHeader>

          <CardContent className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <UsersIcon className="size-4" />
              <span>Kapasitas: {ruang.kapasitas} orang</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPinIcon className="size-4" />
              <span>Lokasi: {ruang.lokasi}</span>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="text-base font-medium">
            Jadwal Peminjaman (Disetujui)
          </h2>

          {daftarJadwal.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada jadwal yang disetujui.
            </p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jam</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {daftarJadwal.map((jadwal) => (
                    <TableRow key={jadwal.id}>
                      <TableCell>{formatTanggal(jadwal.tanggal)}</TableCell>
                      <TableCell>
                        {formatJam(jadwal.mulai)} - {formatJam(jadwal.selesai)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
