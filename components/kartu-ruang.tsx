import Link from "next/link";
import { MapPinIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Ruang } from "@/data/types";
import { ikonJenis, labelJenis } from "@/lib/format";

export function DaftarKartuRuang({ daftarRuang }: { daftarRuang: Ruang[] }) {
  if (daftarRuang.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Belum ada ruang aktif.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {daftarRuang.map((ruang) => {
        const Ikon = ikonJenis[ruang.jenis];
        return (
          <Link
            key={ruang.id}
            href={`/ruang/${ruang.id}`}
            className="block transition-transform hover:-translate-y-0.5"
          >
            <Card className="h-full hover:ring-primary/40">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Ikon className="size-5" />
                  </div>
                  <CardTitle>{ruang.nama}</CardTitle>
                </div>
                <Badge variant="secondary">{labelJenis[ruang.jenis]}</Badge>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <UsersIcon className="size-4 shrink-0" />
                  <span>Kapasitas {ruang.kapasitas} orang</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="size-4 shrink-0" />
                  <span>{ruang.lokasi}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
