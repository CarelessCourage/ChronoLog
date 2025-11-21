import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef
} from '@tanstack/react-table';
import { sendVictorToast } from '@/lib/victor';
import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Days = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
type Projects = "PWEX" | "Vacation" | "Sick Leave" | "Personal Development" | "Administrative Tasks" | "ACL";

interface WeekDate {
  hours: number;
  project: Projects;
  day: Days;
  locked: boolean;
}

const INITIAL_TIMESHEET: WeekDate[] = [
  // Monday - locked
  { hours: 7.5, project: "PWEX", day: "Mon", locked: true },
  // Tuesday - locked
  { hours: 7.5, project: "PWEX", day: "Tue", locked: true },
  // Wednesday - locked
  { hours: 7.5, project: "PWEX", day: "Wed", locked: true },
  // Thursday - locked
  { hours: 7.5, project: "PWEX", day: "Thu", locked: true },
  // Friday - unlocked for user to fill
];

function getWeekDates(): { day: string; date: string }[] {
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  return days.map((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      day,
      date: date.toISOString().split('T')[0]
    };
  });
}

interface TimeSheetRow {
  project: Projects;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
}

const PROJECTS: Projects[] = ["PWEX", "Vacation", "Sick Leave", "Personal Development", "Administrative Tasks", "ACL"];

export function TimePage() {
  const weekDates = useMemo(() => getWeekDates(), []);
  
  // Convert flat array to grid format
  const initialData: TimeSheetRow[] = PROJECTS.map(project => {
    const row: TimeSheetRow = {
      project,
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0
    };

    INITIAL_TIMESHEET.forEach(entry => {
      if (entry.project === project) {
        const dayMap: Record<Days, keyof Omit<TimeSheetRow, 'project'>> = {
          Mon: 'monday',
          Tue: 'tuesday',
          Wed: 'wednesday',
          Thu: 'thursday',
          Fri: 'friday'
        };
        row[dayMap[entry.day]] = entry.hours;
      }
    });

    return row;
  });

  const [data, setData] = useState<TimeSheetRow[]>(initialData);
  const [showSuccess, setShowSuccess] = useState(false);

  const updateHours = (project: string, day: string, hours: number) => {
    setData(prev =>
      prev.map(row => {
        if (row.project === project) {
          const dayKey = day.toLowerCase() as keyof Omit<TimeSheetRow, 'project'>;
          return { ...row, [dayKey]: hours };
        }
        return row;
      })
    );
  };

  const handleSubmit = () => {
    const totalHours = data.reduce((sum, row) => {
      return sum + row.monday + row.tuesday + row.wednesday + row.thursday + row.friday;
    }, 0);

    setShowSuccess(true);
    sendVictorToast(`Timesheet submitted: ${totalHours.toFixed(1)} hours logged this week. Compliance pending review.`, {
      channel: 'victor-compliance'
    });
  };

  const isLocked = (day: string): boolean => {
    const dayMap: Record<string, Days> = {
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri'
    };
    const shortDay = dayMap[day];
    return INITIAL_TIMESHEET.some(entry => entry.day === shortDay && entry.locked);
  };

  const columnHelper = createColumnHelper<TimeSheetRow>();

  const columns = useMemo<ColumnDef<TimeSheetRow, any>[]>(
    () => [
      columnHelper.accessor('project', {
        header: 'Project',
        cell: info => (
          <div className="font-medium text-slate-900 whitespace-nowrap px-4 py-2">
            {info.getValue()}
          </div>
        )
      }),
      ...weekDates.map(({ day, date }) =>
        columnHelper.accessor(day.toLowerCase() as keyof TimeSheetRow, {
          header: () => (
            <div className="text-center">
              <div className="font-semibold">{day.slice(0, 3)}</div>
              <div className="text-xs text-slate-500">{date.slice(5)}</div>
            </div>
          ),
          cell: info => (
            <Input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={info.getValue() as number || ''}
              onChange={e => {
                const val = parseFloat(e.target.value) || 0;
                updateHours(info.row.original.project, day, val);
              }}
              disabled={isLocked(day)}
              className="w-20 text-center"
            />
          )
        })
      )
    ],
    [weekDates]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TopBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Weekly Timesheet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id} className="border-b bg-slate-50">
                        {headerGroup.headers.map(header => (
                          <th key={header.id} className="p-3 text-slate-700">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="border-b hover:bg-slate-50">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="p-2">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleSubmit} size="lg">
                  Submit Timesheet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-semibold">
              Time logged. Compliance achieved.
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-4">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500 text-center">
                ChronoLog Directive
              </p>
              <p className="text-slate-600 text-center">
                Your 7.5 hours have been recorded in accordance with Section 12.4 of the Time Compliance Policy.
              </p>
              <p className="text-slate-500 text-center">
                Thank you for your punctual cooperation. You are now authorized to temporarily detach from your workstation. Enjoy your limited personal time responsibly.
              </p>
              <p className="text-sm text-slate-400 text-center">
                You will be reminded to repeat this ceremony tomorrow.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setShowSuccess(false)} className="w-full sm:w-auto">
              Back to time writing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
