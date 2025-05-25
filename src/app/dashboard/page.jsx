import { ChartAreaInteractive } from "@/components/ui/chart-area-interactive"
import { DataTable } from "@/components/ui/dragHandle"
import { SectionCards } from "@/components/ui/sectionCards"
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
