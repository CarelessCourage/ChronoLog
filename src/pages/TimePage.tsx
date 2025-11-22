import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';
import { sendVictorToast } from '@/lib/victor';
import { TopBar } from '@/components/TopBar';
import { RetroButton } from '@/components/ui/retro-button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Days = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';


interface WeekDate {
  hours: number;
  project: string;
  day: Days;
  locked: boolean;
}

const INITIAL_TIMESHEET: WeekDate[] = [
  // Monday - split across 3 projects
  { hours: 3, project: 'QZX.4827.MA9T2.64', day: 'Mon', locked: true },
  { hours: 2.5, project: 'NPT.1173.HD6R4.85', day: 'Mon', locked: true },
  { hours: 2, project: 'XWF.2649.CE5K0.93', day: 'Mon', locked: true },
  // Tuesday - split across 2 projects
  { hours: 5.5, project: 'DJA.8881.RM2V7.11', day: 'Tue', locked: true },
  { hours: 2, project: 'LKM.7502.YS3B1.22', day: 'Tue', locked: true },
  // Wednesday - split across 4 projects
  { hours: 1.5, project: 'BRN.9305.ZQ1L8.07', day: 'Wed', locked: true },
  { hours: 2.5, project: 'LKM.7502.YS3B1.22', day: 'Wed', locked: true },
  { hours: 1, project: 'QZX.4827.MA9T2.64', day: 'Wed', locked: true },
  { hours: 2.5, project: 'DJA.8881.RM2V7.11', day: 'Wed', locked: true },
  // Thursday - split across 2 projects
  { hours: 4.5, project: 'NPT.1173.HD6R4.85', day: 'Thu', locked: true },
  { hours: 3, project: 'BRN.9305.ZQ1L8.07', day: 'Thu', locked: true },
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
      date: date.toISOString().split('T')[0],
    };
  });
}

interface TimeSheetRow {
  project: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
}

const PROJECTS: string[] = [
'QZX.4827.MA9T2.64',
'BRN.9305.ZQ1L8.07',
'NPT.1173.HD6R4.85',
'LKM.7502.YS3B1.22',
'XWF.2649.CE5K0.93',
'DJA.8881.RM2V7.11'
,
];

export function TimePage() {
  const weekDates = useMemo(() => getWeekDates(), []);

  // Convert flat array to grid format
  const initialData: TimeSheetRow[] = PROJECTS.map((project) => {
    const row: TimeSheetRow = {
      project,
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
    };

    INITIAL_TIMESHEET.forEach((entry) => {
      if (entry.project === project) {
        const dayMap: Record<Days, keyof Omit<TimeSheetRow, 'project'>> = {
          Mon: 'monday',
          Tue: 'tuesday',
          Wed: 'wednesday',
          Thu: 'thursday',
          Fri: 'friday',
        };
        row[dayMap[entry.day]] = entry.hours;
      }
    });

    return row;
  });

  const [data, setData] = useState<TimeSheetRow[]>(initialData);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  const updateHours = (project: string, day: string, hours: number) => {
    setValidationError(''); // Clear any existing errors
    setData((prev) =>
      prev.map((row) => {
        if (row.project === project) {
          const dayKey = day.toLowerCase() as keyof Omit<TimeSheetRow, 'project'>;
          return { ...row, [dayKey]: hours };
        }
        return row;
      })
    );
  };

  const handleSubmit = () => {
    // Validate each day has exactly 7.5 hours
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const dayName = dayNames[i];
      const dayTotal = data.reduce((sum, row) => sum + (row[day] || 0), 0);

      if (dayTotal > 7.5) {
        sendVictorToast(` Overtime!? Nonono, refer to the shadow account excel system`, {
          isViolation: true,
        });
        return;
      } else if (dayTotal < 7.5) {
        sendVictorToast(` What about the faktureringsgrad!?`, { isViolation: true });

        return;
      }
    }

    const totalHours = data.reduce((sum, row) => {
      return sum + row.monday + row.tuesday + row.wednesday + row.thursday + row.friday;
    }, 0);

    setValidationError(''); // Clear any errors
    setShowSuccess(true);
    sendVictorToast(
      `Timesheet submitted: ${totalHours.toFixed(1)} hours logged this week. Compliance pending review.`,
      {
        channel: 'victor-compliance',
      }
    );
  };

  const isLocked = (day: string): boolean => {
    const dayMap: Record<string, Days> = {
      Monday: 'Mon',
      Tuesday: 'Tue',
      Wednesday: 'Wed',
      Thursday: 'Thu',
      Friday: 'Fri',
    };
    const shortDay = dayMap[day];
    return INITIAL_TIMESHEET.some((entry) => entry.day === shortDay && entry.locked);
  };

  const columnHelper = createColumnHelper<TimeSheetRow>();

  const columns = useMemo<ColumnDef<TimeSheetRow, any>[]>(
    () => [
      columnHelper.accessor('project', {
        header: 'Project',
        cell: (info) => (
          <div className="font-medium text-gray-800 whitespace-nowrap px-4 py-2 tracking-wide">
            {info.getValue()}
          </div>
        ),
      }),
      ...weekDates.map(({ day, date }) =>
        columnHelper.accessor(day.toLowerCase() as keyof TimeSheetRow, {
          header: () => (
            <div className="text-center">
              <div className="font-semibold text-gray-800">{day.slice(0, 3).toUpperCase()}</div>
              <div className="text-xs text-gray-600">{date.slice(5)}</div>
            </div>
          ),
          cell: (info) => (
            <Input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={(info.getValue() as number) || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                updateHours(info.row.original.project, day, val);
              }}
              disabled={isLocked(day)}
              className="w-20 text-center win98-inset bg-white text-gray-900 border-gray-500 font-bold disabled:opacity-50 disabled:text-gray-500 disabled:bg-gray-100"
            />
          ),
        })
      ),
    ],
    [weekDates]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300">
      <TopBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Card className="shadow-lg win98-outset bg-white border-gray-600">
            <CardHeader className="border-b-4 border-gray-400">
              <CardTitle className="text-gray-800 tracking-wider font-pixel">
                WEEKLY TIMESHEET
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="border-b-4 border-gray-400 bg-gray-200">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="p-3 text-gray-800 font-bold tracking-wide font-pixel"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b-2 border-gray-300 hover:bg-gray-100 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="p-2 font-pixel">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {validationError && (
                <div className="mt-4 p-4 bg-red-100 border-2 border-red-500 text-red-800 font-medium text-center win98-inset">
                  {validationError}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <RetroButton
                  onClick={handleSubmit}
                  size="lg"
                  className="win98-outset bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold tracking-wider font-pixel"
                >
                  SUBMIT TIMESHEET
                </RetroButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md win98-outset bg-white border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-semibold text-gray-800 tracking-wider font-pixel">
              TIME LOGGED. COMPLIANCE ACHIEVED.
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-4">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-600 text-center">
                ChronoLog Directive
              </p>
              <p className="text-gray-700 text-center">
                Your 7.5 hours have been recorded in accordance with Section 12.4 of the Time
                Compliance Policy.
              </p>
              <p className="text-gray-700 text-center">
                Thank you for your punctual cooperation. You are now authorized to temporarily
                detach from your workstation. Enjoy your limited personal time responsibly.
              </p>
              <p className="text-sm text-gray-500 text-center">
                You will be reminded to repeat this ceremony tomorrow.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <RetroButton
              onClick={() => setShowSuccess(false)}
              className="w-full sm:w-auto win98-outset bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold tracking-wider font-pixel"
            >
              BACK TO TIME WRITING
            </RetroButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
