import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ambilJadwalDisetujui, ambilSemuaRuang } from "@/lib/data";
import { formatJam, formatTanggal } from "@/lib/format";

export default async function PeminjamanPage() {
  const [daftarJadwal, daftarRuang] = await Promise.all([
    ambilJadwalDisetujui(),
    ambilSemuaRuang(),
  ]);

  const namaRuang = new Map(daftarRuang.map((r) => [r.id, r.nama]));

  return (
    <>
      <SiteHeader judul="Jadwal Peminjaman" />
      <div className="space-y-4 p-4 lg:p-6">
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
                  <TableHead>Ruang</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daftarJadwal.map((jadwal) => (
                  <TableRow key={jadwal.id}>
                    <TableCell>{formatTanggal(jadwal.tanggal)}</TableCell>
                    <TableCell>
                      {formatJam(jadwal.mulai)} - {formatJam(jadwal.selesai)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/ruang/${jadwal.ruang_id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {namaRuang.get(jadwal.ruang_id) ?? "-"}
                      </Link>
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
