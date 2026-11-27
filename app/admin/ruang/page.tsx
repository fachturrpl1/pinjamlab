import { AksiRuang } from "@/components/aksi-ruang";
import { FormTambahRuang } from "@/components/form-tambah-ruang";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ambilSemuaRuang } from "@/lib/data";
import { labelJenis } from "@/lib/format";
import { wajibAdmin } from "@/lib/session";

export default async function AdminRuangPage() {
  // Penjagaan sebenarnya ada di baris pertama setiap halaman admin, bukan di sidebar
  await wajibAdmin();

  const daftarRuang = await ambilSemuaRuang();

  return (
    <>
      <SiteHeader judul="Kelola Ruang" />
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex justify-end">
          <FormTambahRuang />
        </div>

        {daftarRuang.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data ruang.</p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Kapasitas</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Aktif</TableHead>
                  <TableHead>Hapus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daftarRuang.map((ruang) => (
                  <TableRow key={ruang.id}>
                    <TableCell className="font-medium">{ruang.nama}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {labelJenis[ruang.jenis]}
                      </Badge>
                    </TableCell>
                    <TableCell>{ruang.kapasitas} orang</TableCell>
                    <TableCell>{ruang.lokasi}</TableCell>
                    {/* key={ruang.id} agar pesan dari server tetap menempel di barisnya */}
                    <AksiRuang
                      key={ruang.id}
                      id={ruang.id}
                      aktif={ruang.aktif}
                    />
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
