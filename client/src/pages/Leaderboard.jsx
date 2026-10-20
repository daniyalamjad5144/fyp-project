import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';


const Leaderboard = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/gamification/leaderboard`);
                setMentors(res.data);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <h1 className="text-3xl font-bold mb-8 text-center text-indigo-700">Top Mentors Leaderboard</h1>

            {loading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                <th className="py-3 px-6 text-left">Rank</th>
                                <th className="py-3 px-6 text-left">Mentor</th>
                                <th className="py-3 px-6 text-left">Points</th>
                                <th className="py-3 px-6 text-left">Level</th>
                                <th className="py-3 px-6 text-left">Badges</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {mentors.filter(m => m && m.user).map((mentor, index) => (
                                <tr key={mentor._id} className="border-b hover:bg-gray-50">
                                    <td className="py-4 px-6 font-bold text-lg text-slate-400">
                                        {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : index + 1}
                                    </td>
                                    <td className="py-4 px-6 flex items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 ${index === 0 ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-200' :
                                            index === 1 ? 'bg-slate-100 text-slate-700 border-2 border-slate-200' :
                                                index === 2 ? 'bg-orange-100 text-orange-700 border-2 border-orange-200' :
                                                    'bg-slate-50 text-slate-400'
                                            }`}>
                                            {mentor.user?.name ? mentor.user.name.charAt(0) : 'M'}
                                        </div>
                                        <span className={`font-bold ${index < 3 ? 'text-slate-900' : 'text-slate-600'}`}>
                                            {mentor.user?.name || 'Mentor'}
                                        </span>
                                    </td>
                                    <td className={`py-4 px-6 font-black ${index === 0 ? 'text-yellow-600' :
                                        index === 1 ? 'text-slate-500' :
                                            index === 2 ? 'text-orange-600' :
                                                'text-slate-400'
                                        }`}>
                                        {mentor.points}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${mentor.level === 'Gold' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                            mentor.level === 'Silver' ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                                                mentor.level === 'Bronze' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                                    'bg-slate-50 text-slate-400 border border-slate-100'
                                            }`}>
                                            {mentor.level || 'Rookie'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex gap-1">
                                            {index < 3 && mentor.badges.map((badge, i) => (
                                                <span key={i} title={badge.name} className="text-xl cursor-help hover:scale-125 transition-transform">{badge.icon}</span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
