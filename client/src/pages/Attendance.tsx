import { useState, useEffect } from 'react';
import {
    Clock,
    Calendar as CalendarIcon,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import hrService, { Attendance as AttendanceType, Employee } from '../services/hr.service';
import { useAuth } from '../context/AuthContext';

export default function Attendance() {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState<AttendanceType[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [logging, setLogging] = useState(false);

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [attData, empData] = await Promise.all([
                hrService.getAttendance(selectedDate),
                hrService.getEmployees()
            ]);
            setAttendance(attData);
            setEmployees(empData);
        } catch (error) {
            console.error('Failed to fetch attendance', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClockAction = async (status: 'PRESENT' | 'ABSENT' | 'LATE') => {
        const currentEmployee = employees.find(e => e.email === user?.email);
        if (!currentEmployee) {
            alert('Your user account is not linked to an employee profile. Please contact Admin.');
            return;
        }

        setLogging(true);
        try {
            await hrService.logAttendance({
                employee: currentEmployee._id,
                date: new Date(selectedDate),
                status,
                checkIn: status === 'PRESENT' || status === 'LATE' ? new Date() : null,
            });
            fetchData();
        } catch (error) {
            console.error('Failed to log attendance', error);
        } finally {
            setLogging(false);
        }
    };

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Attendance Log</h1>
                    <p className="text-gray-500 font-medium">Daily clock-in entries and team availability tracking</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <input
                        type="date"
                        className="bg-transparent border-none font-black text-xs uppercase tracking-widest focus:ring-0 cursor-pointer"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Clock className="w-32 h-32" />
                        </div>

                        <div className="space-y-2 relative">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400">Quick Actions</p>
                            <h2 className="text-2xl font-black">Daily Check-in</h2>
                            <p className="text-gray-400 text-sm font-medium">Log your status for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 relative">
                            <button
                                onClick={() => handleClockAction('PRESENT')}
                                disabled={logging}
                                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/5 active:scale-95 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500 rounded-xl">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold uppercase tracking-widest text-[10px]">Present / In</span>
                                </div>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => handleClockAction('LATE')}
                                disabled={logging}
                                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/5 active:scale-95 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500 rounded-xl">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold uppercase tracking-widest text-[10px]">Mark Late Entry</span>
                                </div>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => handleClockAction('ABSENT')}
                                disabled={logging}
                                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/5 active:scale-95 group text-red-300 hover:text-red-100"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500 rounded-xl">
                                        <XCircle className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold uppercase tracking-widest text-[10px]">Mark Absent</span>
                                </div>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 relative">
                            <AlertCircle className="w-5 h-5 text-gray-400" />
                            <p className="text-[10px] text-gray-400 font-medium">Auto-logs your current location and device timestamp.</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Team Visibility</label>
                        <div className="flex gap-4">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                {attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length} In
                            </span>
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                {attendance.filter(a => a.status === 'ABSENT').length} Out
                            </span>
                        </div>
                    </div>

                    <div className="p-0 overflow-y-auto max-h-[600px]">
                        {attendance.length > 0 ? (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Employee</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Check In</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Check Out</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {attendance.map((att) => (
                                        <tr key={att._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-black text-[10px] text-gray-500">
                                                        {(att.employee as Employee)?.firstName?.[0] || 'E'}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-gray-900">{(att.employee as Employee)?.firstName} {(att.employee as Employee)?.lastName}</p>
                                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{(att.employee as Employee)?.designation}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${att.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' :
                                                        att.status === 'LATE' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-red-50 text-red-600'
                                                    }`}>
                                                    {att.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-xs font-bold text-gray-700">
                                                {att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </td>
                                            <td className="px-8 py-4 text-xs font-bold text-gray-700">
                                                {att.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-20 text-center space-y-4">
                                <CalendarIcon className="w-12 h-12 text-gray-200 mx-auto" />
                                <div>
                                    <p className="text-sm font-black text-gray-900">No logs for this date</p>
                                    <p className="text-xs text-gray-500">Attendance records will appear here as team members clock in.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
