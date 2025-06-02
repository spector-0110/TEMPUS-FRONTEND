import { ChartAreaInteractive } from "@/components/ui/chart-area-interactive"
import { DataTable } from "@/components/ui/drag-handle"
import { SectionCards } from "@/components/ui/section-cards"
import data from "./data.json";

export default function DashBoardComponent() {
  return (
    <>
      <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
      <DataTable data={data} />
    </>
  );
}
