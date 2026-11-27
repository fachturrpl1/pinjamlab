import Link from "next/link";
import { AksiPermohonan } from "@/components/aksi-permohonan";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Status } from "@/data/types";
import { ambilPermohonan, ambilStatistik } from "@/lib/data-admin";
import { formatJam, formatTanggal, nomorPermohonan } from "@/lib/format";
import { wajibAdmin } from "@/lib/session";

const FILTER_STATUS: { label: string; href: string; nilai?: Status }[] = [
  { label: "Semua", href: "/admin" },
  { label: "Menunggu", href: "/admin?status=menunggu", nilai: "menunggu" },
  { label: "Disetujui", href: "/admin?status=disetujui", nilai: "disetujui" },
  { label: "Ditolak", href: "/admin?status=ditolak", nilai: "ditolak" },
];

const STATUS_VALID: Status[] = ["menunggu", "disetujui", "ditolak"];

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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  // Penjagaan sebenarnya ada di baris pertama setiap halaman admin, bukan di sidebar
  await wajibAdmin();

  const { status } = await searchParams;
  // Nilai ?status= tak dikenal diabaikan dan tampilkan semua permohonan tanpa error
  const statusTerpilih = STATUS_VALID.includes(status as Status)
    ? (status as Status)
    : undefined;

  const [statistik, daftarPermohonan] = await Promise.all([
    ambilStatistik(),
    ambilPermohonan(statusTerpilih),
  ]);

  return (
    <>
      <SiteHeader judul="Permohonan Peminjaman" />
      <div className="space-y-6 p-4 lg:p-6">
        <SectionCards
          menunggu={statistik.menunggu}
          disetujui={statistik.disetujui}
          ditolak={statistik.ditolak}
          ruangAktif={statistik.ruangAktif}
        />

        <div className="flex flex-wrap gap-2">
          {FILTER_STATUS.map((item) => {
            const aktif = item.nilai === statusTerpilih;
            return (
              <Button
                key={item.href}
                asChild
                size="sm"
                variant={aktif ? "default" : "outline"}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            );
          })}
        </div>

        {daftarPermohonan.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada permohonan.
          </p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Peminjam</TableHead>
                  <TableHead>Ruang</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead>Jumlah Orang</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daftarPermohonan.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {nomorPermohonan(item.id)}
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-normal">
                      <div className="font-medium">{item.peminjam}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.keperluan}
                      </div>
                    </TableCell>
                    <TableCell>{item.nama_ruang}</TableCell>
                    <TableCell>{formatTanggal(item.tanggal)}</TableCell>
                    <TableCell>
                      {formatJam(item.mulai)} - {formatJam(item.selesai)}
                    </TableCell>
                    <TableCell>{item.jumlah_orang} orang</TableCell>
                    <TableCell className="max-w-xs whitespace-normal">
                      <div className="space-y-1">
                        {badgeStatus(item.status)}
                        {item.status === "ditolak" && item.alasan_tolak && (
                          <p className="text-xs text-muted-foreground">
                            {item.alasan_tolak}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {/* key={item.id} menjaga state pesan hasil tidak hilang saat status berubah */}
                      <AksiPermohonan
                        key={item.id}
                        id={item.id}
                        status={item.status}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
