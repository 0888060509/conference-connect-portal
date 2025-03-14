
import { File, FileText, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportExportFormat } from "@/types/reports";

interface ReportFormatsProps {
  onExport: (format: ReportExportFormat) => void;
}

export function ReportFormats({ onExport }: ReportFormatsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onExport('pdf')}>
          <File className="mr-2 h-4 w-4" />
          <span>PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('excel')}>
          <Table className="mr-2 h-4 w-4" />
          <span>Excel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('csv')}>
          <FileText className="mr-2 h-4 w-4" />
          <span>CSV</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
