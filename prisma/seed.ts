import { prisma } from "@/lib/prisma";

const initialBranches = [
  {
    id: 1,
    name: "Soli 62 Tân Tạo",
    abbreviation: "TT",
    address: "14 đường số 2, phường Tân Tạo, quận Bình Tân, Tp. Hồ Chí Minh",
    email: "soli.tantao@gmail.com",
    phone: "0333 717 560",
    createdAt: new Date(2026, 6, 28),
    createdBy: 1,
    updatedAt: new Date(2026, 6, 28),
    updatedBy: 1,
  },
  {
    id: 2,
    name: "Soli 14 Nguyễn Văn Luông",
    abbreviation: "NVL",
    address: "109/24 Nguyễn Văn Luông, phường 10, quận 6, Tp. Hồ Chí Minh",
    email: "soli.nvl@gmail.com",
    phone: "0333 250 017",
    createdAt: new Date(2026, 6, 28),
    createdBy: 1,
    updatedAt: new Date(2026, 6, 28),
    updatedBy: 1,
  },
];

async function main() {
  for (const branch of initialBranches) {
    await prisma.branch.create({ data: branch });
  }
}

main()
  .then(() => console.log("Seeding done."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
