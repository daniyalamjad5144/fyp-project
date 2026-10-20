import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, Award, User, BookOpen, MessageSquare, LogOut, Search, Trophy, Video, Gift, Lock, X, CreditCard, DollarSign, Edit3, Save, Plus, Trash2 } from 'lucide-react';
import MeetingCard from '../components/MeetingCard';
import { API_URL } from '../config';


const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileForm, setProfileForm] = useState({
        bio: '',
        university: '',
        degree: '',
        skillsInput: '',
        skills: []
    });
    const [withdrawMethod, setWithdrawMethod] = useState('paypal');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawDetails, setWithdrawDetails] = useState({
        paypalEmail: '',
        accountName: '',
        accountNumber: '',
        bankName: '',
        ifsc: '',
        businessId: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    navigate('/login');
                    return;
                }

                // Fetch user profile
                const profileRes = await axios.get(`${API_URL}/api/profile/me`, {
                    headers: { 'x-auth-token': token }
                });

                setUser(profileRes.data.user);
                const loadedProfile = profileRes.data.profile;
                setProfile(loadedProfile);

                // Pre-fill edit form with existing profile data
                if (loadedProfile) {
                    setProfileForm({
                        bio: loadedProfile.bio || '',
                        university: loadedProfile.university || '',
                        degree: loadedProfile.degree || '',
                        skillsInput: '',
                        skills: loadedProfile.skills || []
                    });
                }

                // Fetch sessions
                const sessionsRes = await axios.get(`${API_URL}/api/sessions`, {
                    headers: { 'x-auth-token': token }
                });

                setSessions(sessionsRes.data);

                // Fetch meetings
                const meetingsRes = await axios.get(`${API_URL}/api/meetings`, {
                    headers: { 'x-auth-token': token }
                });

                setMeetings(meetingsRes.data.meetings || []);

            } catch (err) {
                console.error('Dashboard error:', err);
                if (err.response?.status === 401 || err.response?.status === 404) {
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    setError('Failed to load dashboard data');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const handleSaveProfile = async () => {
        try {
            setProfileSaving(true);
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/profile`, {
                bio: profileForm.bio,
                university: profileForm.university,
                degree: profileForm.degree,
                skills: profileForm.skills,
                availability: profile?.availability || []
            }, { headers: { 'x-auth-token': token } });

            setProfile(res.data);
            setShowEditProfile(false);
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 3000);
        } catch (err) {
            console.error('Profile save error:', err);
        } finally {
            setProfileSaving(false);
        }
    };

    const handleAddSkill = () => {
        const skill = profileForm.skillsInput.trim();
        if (skill && !profileForm.skills.includes(skill)) {
            setProfileForm(prev => ({ ...prev, skills: [...prev.skills, skill], skillsInput: '' }));
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setProfileForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            accepted: 'bg-green-100 text-green-800',
            scheduled: 'bg-blue-100 text-blue-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const handleRedeem = async (rewardType) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/gamification/redeem`, { rewardType }, {
                headers: { 'x-auth-token': token }
            });


            if (res.data.success) {
                setProfile(res.data.profile);
                alert(res.data.message);
            }
        } catch (err) {
            console.error('Redeem error:', err);
            alert(err.response?.data?.message || 'Failed to redeem reward');
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/profile/withdraw`, {
                amount: parseFloat(withdrawAmount),
                method: withdrawMethod,
                details: withdrawDetails
            }, {
                headers: { 'x-auth-token': token }
            });


            if (res.data.success) {
                setProfile(res.data.profile);
                setShowWithdrawModal(false);
                setWithdrawAmount('');
                alert(res.data.message);
            }
        } catch (err) {
            console.error('Withdraw error:', err);
            alert(err.response?.data?.message || 'Failed to submit withdrawal request');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto mt-10">
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
                    {error}
                </div>
            </div>
        );
    }

    const upcomingSessions = sessions.filter(s =>
        ['pending', 'accepted', 'scheduled'].includes(s.status) &&
        new Date(s.scheduledAt) > new Date()
    );

    const completedSessions = sessions.filter(s => s.status === 'completed');

    const upcomingMeetings = meetings.filter(m =>
        m.status === 'scheduled' &&
        new Date(m.scheduledAt) > new Date()
    );

    const completedMeetings = meetings.filter(m => m.status === 'completed');

    return (
        <div className="max-w-7xl mx-auto mt-8 px-4">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                    Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-slate-600">Here's what's happening with your learning journey</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 rounded-2xl shadow-lg shadow-primary-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-primary-100 text-sm font-medium">Upcoming Sessions</p>
                            <p className="text-3xl font-bold mt-1">{upcomingSessions.length}</p>
                        </div>
                        <Calendar className="w-10 h-10 opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white p-6 rounded-2xl shadow-lg shadow-secondary-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-secondary-100 text-sm font-medium">Completed Sessions</p>
                            <p className="text-3xl font-bold mt-1">{completedSessions.length}</p>
                        </div>
                        <CheckCircle className="w-10 h-10 opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-accent-500 to-accent-600 text-white p-6 rounded-2xl shadow-lg shadow-accent-500/20 text-center">
                    <p className="text-accent-100 text-sm font-medium">Your Role</p>
                    <p className="text-2xl font-bold mt-1 capitalize">{user?.role}</p>
                </div>

                {user?.role === 'mentor' && profile && (
                    <>
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-sm font-medium">Mentor Level</p>
                                    <p className="text-3xl font-bold mt-1">{profile.level || 'Bronze'}</p>
                                </div>
                                <Trophy className="w-10 h-10 opacity-80" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg shadow-emerald-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium">Total Earnings</p>
                                    <p className="text-3xl font-bold mt-1">${profile.totalEarnings || 0}</p>
                                </div>
                                <Award className="w-10 h-10 opacity-80" />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Upcoming Meetings Section */}
            {upcomingMeetings.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Video className="w-6 h-6 text-primary-600" />
                            Upcoming Meetings
                        </h2>
                        <span className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-bold">
                            {upcomingMeetings.length} Scheduled
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingMeetings.slice(0, 3).map((meeting) => (
                            <MeetingCard
                                key={meeting._id}
                                meeting={meeting}
                                userRole={user?.role}
                            />
                        ))}
                    </div>
                    {upcomingMeetings.length > 3 && (
                        <div className="text-center mt-6">
                            <Link
                                to="/meetings"
                                className="text-primary-600 hover:text-primary-700 font-bold text-sm"
                            >
                                View all {upcomingMeetings.length} meetings →
                            </Link>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Profile & Quick Actions) */}
                <div className="space-y-8">
                    {/* Profile Section */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary-600" />
                            Your Profile
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Email</p>
                                <p className="font-medium text-slate-900">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Account Type</p>
                                <p className="font-medium text-slate-900 capitalize">{user?.role}</p>
                            </div>
                        </div>

                        {user?.role === 'mentor' && (
                            <div className="mt-6 border-t border-slate-100 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Award className="w-5 h-5 text-accent-500" />
                                        Mentor Profile
                                    </h3>
                                    <button
                                        onClick={() => {
                                            if (profile) {
                                                setProfileForm({ bio: profile.bio || '', university: profile.university || '', degree: profile.degree || '', skillsInput: '', skills: profile.skills || [] });
                                            }
                                            setShowEditProfile(!showEditProfile);
                                        }}
                                        className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        {showEditProfile ? 'Cancel' : 'Edit Profile'}
                                    </button>
                                </div>

                                {profileSaved && (
                                    <div className="mb-3 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-2 rounded-lg flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Profile saved successfully!
                                    </div>
                                )}

                                {showEditProfile ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-slate-500 text-xs uppercase font-bold tracking-wider block mb-1">Bio</label>
                                            <textarea
                                                rows={3}
                                                value={profileForm.bio}
                                                onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                                                placeholder="Tell learners about yourself..."
                                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-slate-500 text-xs uppercase font-bold tracking-wider block mb-1">University</label>
                                            <input
                                                type="text"
                                                value={profileForm.university}
                                                onChange={e => setProfileForm(p => ({ ...p, university: e.target.value }))}
                                                placeholder="e.g. FAST NUCES, NUST..."
                                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-slate-500 text-xs uppercase font-bold tracking-wider block mb-1">Degree / Field</label>
                                            <input
                                                type="text"
                                                value={profileForm.degree}
                                                onChange={e => setProfileForm(p => ({ ...p, degree: e.target.value }))}
                                                placeholder="e.g. BS Computer Science..."
                                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-slate-500 text-xs uppercase font-bold tracking-wider block mb-1">Skills</label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {profileForm.skills.map((skill, i) => (
                                                    <span key={i} className="flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold">
                                                        {skill}
                                                        <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-600 ml-1">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={profileForm.skillsInput}
                                                    onChange={e => setProfileForm(p => ({ ...p, skillsInput: e.target.value }))}
                                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                                    placeholder="Add a skill & press Enter"
                                                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                                />
                                                <button onClick={handleAddSkill} className="bg-primary-600 text-white px-3 py-2 rounded-xl hover:bg-primary-700 transition-colors">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={profileSaving}
                                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-2.5 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-60"
                                        >
                                            {profileSaving ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            {profileSaving ? 'Saving...' : 'Save Profile'}
                                        </button>
                                    </div>
                                ) : profile ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Bio</p>
                                            <p className="text-slate-700 text-sm leading-relaxed mt-1">{profile.bio || <span className="italic text-slate-400">No bio yet — click Edit Profile!</span>}</p>
                                        </div>
                                        {profile.university && (
                                            <div>
                                                <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">University</p>
                                                <p className="font-medium text-slate-900">{profile.university}</p>
                                            </div>
                                        )}
                                        {profile.degree && (
                                            <div>
                                                <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Degree</p>
                                                <p className="font-medium text-slate-900">{profile.degree}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Skills</p>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.skills?.length > 0 ? profile.skills.map((skill, index) => (
                                                    <span key={index} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold">
                                                        {skill}
                                                    </span>
                                                )) : <span className="italic text-slate-400 text-sm">No skills added yet.</span>}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Points</span>
                                            <span className="font-bold text-accent-600">{profile.points} XP</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                                        <p className="text-yellow-800 text-sm mb-3">Profile loading...</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


                    {/* Quick Actions */}
                    <div className="card bg-gradient-to-br from-slate-50 to-white">
                        <h3 className="text-lg font-bold mb-4 text-slate-900">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/find-mentor" className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-primary-200 transition-all text-center group">
                                <Search className="w-6 h-6 mx-auto mb-2 text-primary-500 group-hover:scale-110 transition-transform" />
                                <p className="text-xs font-bold text-slate-700">Find Mentors</p>
                            </Link>
                            <Link to="/leaderboard" className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-accent-200 transition-all text-center group">
                                <Trophy className="w-6 h-6 mx-auto mb-2 text-accent-500 group-hover:scale-110 transition-transform" />
                                <p className="text-xs font-bold text-slate-700">Leaderboard</p>
                            </Link>
                            <Link to="/chat" className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-green-200 transition-all text-center group">
                                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-green-500 group-hover:scale-110 transition-transform" />
                                <p className="text-xs font-bold text-slate-700">Chat</p>
                            </Link>
                            <button onClick={() => {
                                localStorage.removeItem('token');
                                navigate('/login');
                            }} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-red-200 transition-all text-center group">
                                <LogOut className="w-6 h-6 mx-auto mb-2 text-red-500 group-hover:scale-110 transition-transform" />
                                <p className="text-xs font-bold text-slate-700">Logout</p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column (Sessions & Activity) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Upcoming Sessions */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary-600" />
                                Upcoming Sessions
                            </h2>
                            <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold">
                                {upcomingSessions.length} Total
                            </span>
                        </div>

                        {upcomingSessions.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingSessions.slice(0, 3).map((session) => (
                                    <div key={session._id} className="border border-slate-100 rounded-xl p-5 hover:shadow-md transition-shadow bg-slate-50/50">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-slate-800 text-lg">{session.topic}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(session.status)}`}>
                                                {session.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 mb-4 text-sm">{session.description}</p>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                            <Clock className="w-4 h-4" />
                                            {formatDate(session.scheduledAt)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium mb-4">No upcoming sessions</p>
                                <Link
                                    to="/find-mentor"
                                    className="btn-primary inline-flex items-center gap-2"
                                >
                                    Find a Mentor
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-secondary-600" />
                            Recent Activity
                        </h2>

                        {sessions.length > 0 ? (
                            <div className="space-y-4">
                                {sessions.slice(0, 5).map((session) => (
                                    <div key={session._id} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                        <div className={`w-3 h-3 rounded-full mt-1.5 ${session.status === 'completed' ? 'bg-secondary-500' :
                                            session.status === 'cancelled' ? 'bg-red-500' :
                                                'bg-primary-500'
                                            }`}></div>
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-800">{session.topic}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {session.status === 'completed' ? 'Completed' : 'Scheduled'} • {formatDate(session.scheduledAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-500">No activity yet</p>
                                <p className="text-sm text-slate-400 mt-2">Book your first session to get started!</p>
                            </div>
                        )}
                    </div>

                    {/* Mentor Earnings & Paychecks Section */}
                    {user?.role === 'mentor' && (
                        <div className="card border-l-4 border-l-emerald-500">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Award className="w-5 h-5 text-emerald-600" />
                                Earnings & Paychecks
                            </h2>

                            <div className="bg-emerald-50 rounded-xl p-4 mb-6 flex justify-between items-center border border-emerald-100">
                                <div>
                                    <p className="text-emerald-800 text-xs font-bold uppercase tracking-wider">Available Balance</p>
                                    <p className="text-2xl font-black text-emerald-900">${(profile?.availableBalance || 0).toFixed(2)}</p>
                                </div>
                                <button
                                    onClick={() => setShowWithdrawModal(true)}
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition shadow-md shadow-emerald-500/20"
                                >
                                    Withdraw Now
                                </button>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Recent Paychecks
                                </h3>

                                {[
                                    { date: 'Oct 15, 2024', amount: profile?.totalEarnings ? (profile.totalEarnings / 4).toFixed(2) : 0, status: 'Paid' },
                                    { date: 'Sep 15, 2024', amount: profile?.totalEarnings ? (profile.totalEarnings / 5).toFixed(2) : 0, status: 'Paid' }
                                ].map((pay, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-white">
                                        <div>
                                            <p className="font-bold text-slate-800">{pay.date}</p>
                                            <p className="text-xs text-slate-500 font-medium">Monthly Payout</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900">${pay.amount}</p>
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">{pay.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Points Redemption System */}
                    {user?.role === 'mentor' && (
                        <div className="card border-l-4 border-l-primary-500 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Trophy className="w-20 h-20" />
                            </div>

                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Gift className="w-5 h-5 text-primary-600" />
                                Rewards & Redemption
                            </h2>

                            <div className="space-y-4">
                                <div className={`p-5 rounded-2xl border-2 transition-all ${profile?.points >= 1000 ? 'border-primary-200 bg-primary-50/30' : 'border-slate-100 bg-slate-50/50 grayscale opacity-60'}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-slate-800 uppercase tracking-tight">Elite Mentor Badge</h3>
                                                {profile?.points >= 1000 ? (
                                                    <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded font-black">UNLOCKED</span>
                                                ) : (
                                                    <span className="text-[10px] bg-slate-400 text-white px-2 py-0.5 rounded font-black flex items-center gap-1">
                                                        <Lock className="w-2 h-2" /> {1000 - (profile?.points || 0)} XP TO GO
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600">Claim your exclusive 'Elite' badge and appear at the top of search results.</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-2xl">
                                            👑
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRedeem('badge')}
                                        disabled={profile?.points < 1000}
                                        className={`w-full mt-4 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${profile?.points >= 1000
                                            ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {profile?.points >= 1000 ? 'Redeem Now' : 'Locked'}
                                    </button>
                                </div>

                                <div className={`p-5 rounded-2xl border-2 transition-all ${profile?.points >= 1000 ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50 grayscale opacity-60'}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-slate-800 uppercase tracking-tight">$100 Cash Payout</h3>
                                                {profile?.points >= 1000 ? (
                                                    <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded font-black">READY</span>
                                                ) : (
                                                    <span className="text-[10px] bg-slate-400 text-white px-2 py-0.5 rounded font-black flex items-center gap-1">
                                                        <Lock className="w-2 h-2" /> {1000 - (profile?.points || 0)} XP TO GO
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600">Trade 1000 XP points for an immediate $100 balance boost.</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-emerald-100 flex items-center justify-center text-2xl text-emerald-600 font-bold">
                                            $
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRedeem('cash')}
                                        disabled={profile?.points < 1000}
                                        className={`w-full mt-4 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${profile?.points >= 1000
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/30'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {profile?.points >= 1000 ? 'Claim $100 Cash' : 'Locked'}
                                    </button>
                                </div>

                                <div className={`p-5 rounded-2xl border-2 transition-all ${profile?.points >= 1500 ? 'border-accent-200 bg-accent-50/30' : 'border-slate-100 bg-slate-50/50 grayscale opacity-60'}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-slate-800 uppercase tracking-tight">Premium Profile Theme</h3>
                                                {profile?.points >= 1500 ? (
                                                    <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded font-black">UNLOCKED</span>
                                                ) : (
                                                    <span className="text-[10px] bg-slate-400 text-white px-2 py-0.5 rounded font-black flex items-center gap-1">
                                                        <Lock className="w-2 h-2" /> {1500 - (profile?.points || 0)} XP TO GO
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600">Unlock a custom dark-mode profile theme with animated backgrounds.</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-2xl">
                                            ✨
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRedeem('theme')}
                                        disabled={profile?.points < 1500}
                                        className={`w-full mt-4 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${profile?.points >= 1500
                                            ? 'bg-accent-600 text-white hover:bg-accent-700 shadow-lg shadow-accent-500/30'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {profile?.points >= 1500 ? 'Redeem Now' : 'Locked'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Withdrawal Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Withdraw Earnings</h3>
                            </div>
                            <button onClick={() => setShowWithdrawModal(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 truncate transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleWithdraw} className="p-8 space-y-6">
                            {/* Amount Input */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Withdraw Amount ($)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max={profile?.availableBalance}
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-medium">Max available: <span className="text-emerald-600 font-bold">${profile?.availableBalance.toFixed(2)}</span></p>
                            </div>

                            {/* Method Selector */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Select Payment Method</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['paypal', 'bank', 'b2c'].map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setWithdrawMethod(m)}
                                            className={`py-3 rounded-xl border-2 transition-all font-bold text-xs uppercase ${withdrawMethod === m
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                                }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Method Details */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                {withdrawMethod === 'paypal' && (
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">PayPal Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={withdrawDetails.paypalEmail}
                                            onChange={(e) => setWithdrawDetails({ ...withdrawDetails, paypalEmail: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"
                                            placeholder="your-email@paypal.com"
                                        />
                                    </div>
                                )}

                                {withdrawMethod === 'bank' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Account Holder Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={withdrawDetails.accountName}
                                                onChange={(e) => setWithdrawDetails({ ...withdrawDetails, accountName: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"
                                                placeholder="Full Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Account Number</label>
                                            <input
                                                type="text"
                                                required
                                                value={withdrawDetails.accountNumber}
                                                onChange={(e) => setWithdrawDetails({ ...withdrawDetails, accountNumber: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"
                                                placeholder="Numbers only"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">IFSC / BIC Code</label>
                                            <input
                                                type="text"
                                                required
                                                value={withdrawDetails.ifsc}
                                                onChange={(e) => setWithdrawDetails({ ...withdrawDetails, ifsc: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"
                                                placeholder="IFSC000123"
                                            />
                                        </div>
                                    </div>
                                )}

                                {withdrawMethod === 'b2c' && (
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Business / Merchant ID</label>
                                        <input
                                            type="text"
                                            required
                                            value={withdrawDetails.businessId}
                                            onChange={(e) => setWithdrawDetails({ ...withdrawDetails, businessId: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"
                                            placeholder="Enter Merchant ID"
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2"
                            >
                                <DollarSign className="w-5 h-5" />
                                Submit Payout Request
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
