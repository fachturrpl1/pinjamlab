import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards({
  menunggu,
  disetujui,
  ditolak,
  ruangAktif,
}: {
  menunggu: number;
  disetujui: number;
  ditolak: number;
  ruangAktif: number;
}) {
  const kartu = [
    { judul: "Menunggu", nilai: menunggu },
    { judul: "Disetujui", nilai: disetujui },
    { judul: "Ditolak", nilai: ditolak },
    { judul: "Ruang Aktif", nilai: ruangAktif },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kartu.map((item) => (
        <Card key={item.judul}>
          <CardHeader>
            <CardDescription>{item.judul}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {item.nilai}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
