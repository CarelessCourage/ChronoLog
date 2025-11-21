import { useEffect, useState } from 'react';
import { storage, TimeEntry } from '@/lib/storage';
import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export function TimePage() {
  const todayDate = getTodayDate();
  const [description, setDescription] = useState('Regular work day');
  const [hours, setHours] = useState('7.5');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const existingEntry = storage.entries.getByDate(todayDate);
    if (existingEntry) {
      setDescription(existingEntry.description);
      setHours(existingEntry.hours.toString());
    }
    setIsLoaded(true);
  }, [todayDate]);

  const handleSave = () => {
    setError('');
    setShowSuccess(false);

    const hoursNum = parseFloat(hours);

    if (isNaN(hoursNum) || hoursNum <= 0) {
      setError('Hours must be a positive number');
      return;
    }

    const entry: TimeEntry = {
      date: todayDate,
      description: description.trim() || 'Regular work day',
      hours: hoursNum
    };

    storage.entries.save(entry);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TopBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Time Entry for Today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left p-3 font-semibold text-slate-700">Date</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Description</th>
                      <th className="text-left p-3 font-semibold text-slate-700 w-32">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 text-slate-600 font-medium">{todayDate}</td>
                      <td className="p-3">
                        <Input
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Description of work"
                          className="w-full"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          value={hours}
                          onChange={(e) => setHours(e.target.value)}
                          className="w-full"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {showSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Time entry saved successfully!
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={handleSave} className="w-full">
                Save Time Entry
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200 bg-slate-50">
            <CardHeader>
              <CardTitle className="text-sm text-slate-600">Future Enhancements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                This area is reserved for future notifications, compliance warnings, and messages from Victor.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
