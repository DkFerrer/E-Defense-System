// E-Defense — Dashboard Screen (Adviser Acceptance Form)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../contexts/AuthContext';
import { adviserRequestApi, AdviserRequestPayload } from '../../api/adviserRequests';

// @ts-ignore
import UNCLogo from '../../assets/unc-logo.png'; export const DashboardScreen: React.FC = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('My Dashboard');

  const menuItems = user?.role === 'student_researcher'
    ? [
      { name: 'My Dashboard', icon: 'grid-outline' },
      { name: 'Book a Defense', icon: 'calendar-outline' },
      { name: 'Submitted', icon: 'paper-plane-outline' },
      { name: 'Results', icon: 'bar-chart-outline' },
      { name: 'Profile', icon: 'person-outline' },
    ]
    : [
      { name: 'My Dashboard', icon: 'grid-outline' },
      { name: 'Results', icon: 'bar-chart-outline' },
      { name: 'Profile', icon: 'person-outline' },
    ];

  // Form State
  const [formData, setFormData] = useState({
    yearLevel: user?.grade_level || '3rd Year - 2nd Semester',
    contactNumber: user?.phone_number || '',
    emailAddress: user?.email || '',
    researchTitle: '',
    researchArea: '',
    preferredAdviser: '',
    adviserEmail: '',
    groupMembers: '',
    researchObjectives: '',
    expectedDefenseDate: '',
    documentUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [adviserRequests, setAdviserRequests] = useState<any[]>([]);
  const [advisers, setAdvisers] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Search and status filter states for Adviser/Dean
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Suggested E-Defense UI States
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [mockBookingData, setMockBookingData] = useState({
    defenseType: 'Title Defense',
    title: '',
    members: '',
  });

  const [notifications, setNotifications] = useState<any[]>([
    {
      id: 1,
      title: 'Welcome to E-Defense!',
      message: 'Your research profile has been successfully loaded. Click "+ Add Proposal" to submit to your adviser.',
      time: 'Just now',
      read: false,
      type: 'info',
      icon: 'information-circle-outline'
    },
    {
      id: 2,
      title: 'Academic Calendar Update',
      message: 'SCIS Department defense bookings are now open for May 2026. View available times in "Book a Defense".',
      time: '2 hours ago',
      read: true,
      type: 'calendar',
      icon: 'calendar-outline'
    }
  ]);

  // Sync request status to Notification center dynamically
  useEffect(() => {
    if (existingRequest) {
      const isApproved = existingRequest.status === 'approved';
      const isRejected = existingRequest.status === 'rejected';
      const currentNotifId = isApproved ? 99 : isRejected ? 98 : 100;

      const hasCurrentNotif = notifications.some(n => n.id === currentNotifId);
      if (!hasCurrentNotif) {
        setNotifications(prev => {
          const filtered = prev.filter(n => n.id !== 99 && n.id !== 98 && n.id !== 100);
          return [
            {
              id: currentNotifId,
              title: isApproved ? 'Request Approved! 🎉' : isRejected ? 'Request Returned' : 'Request Submitted',
              message: isApproved
                ? `Your Adviser Acceptance Request for "${existingRequest.research_title}" has been APPROVED by ${existingRequest.adviser_name}.`
                : isRejected
                  ? `Your request for "${existingRequest.research_title}" was returned. Reason: ${existingRequest.rejection_reason || 'Please contact your adviser.'}`
                  : `Your Adviser Acceptance Request is pending review by ${existingRequest.adviser_name}.`,
              time: 'Just now',
              read: false,
              type: isApproved ? 'success' : isRejected ? 'warning' : 'warning',
              icon: isApproved ? 'checkmark-circle-outline' : isRejected ? 'arrow-undo-outline' : 'time-outline'
            },
            ...filtered
          ];
        });
      }
    }
  }, [existingRequest]);

  // Sync adviser requests to notifications dynamically for the adviser
  useEffect(() => {
    if (user?.role === 'adviser' && adviserRequests.length > 0) {
      const pendingReqs = adviserRequests.filter(req => req.status === 'pending');
      const newNotifs = pendingReqs.map(req => ({
        id: `adv-req-${req.id}`,
        title: 'Adviser Request Received 📄',
        message: `${req.student?.first_name} ${req.student?.last_name} (${req.student?.student_number || '2026-0001'}) is requesting you as adviser for "${req.research_title}"`,
        time: 'Pending review',
        read: false,
        type: 'warning',
        icon: 'document-text-outline'
      }));

      setNotifications(prev => {
        const currentAdvReqNotifs = prev.filter(n => typeof n.id === 'string' && n.id.startsWith('adv-req-'));
        const needsUpdate = currentAdvReqNotifs.length !== newNotifs.length ||
          newNotifs.some(newN => !prev.some(p => p.id === newN.id));

        if (!needsUpdate) {
          return prev;
        }

        const cleanPrev = prev.filter(n => typeof n.id !== 'string' || !n.id.startsWith('adv-req-'));
        return [...newNotifs, ...cleanPrev];
      });
    }
  }, [adviserRequests, user?.role]);

  // Results Tab Filters
  const [resultsSearch, setResultsSearch] = useState('');
  const [resultsDept, setResultsDept] = useState('All Departments');
  const [resultsStage, setResultsStage] = useState('All Stages');
  const [showResultsDept, setShowResultsDept] = useState(false);
  const [showResultsStage, setShowResultsStage] = useState(false);
  const [selectedResultGroup, setSelectedResultGroup] = useState<any>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewComments, setReviewComments] = useState<{ [key: number]: string }>({});

  const MOCK_GROUPS = [
    {
      id: 1,
      title: 'Blockchain-Based Student Records Management System',
      members: ['Sarah Williams', 'Michael Brown'],
      adviser: 'Dr. Maria Santos',
      program: 'BS Information Technology',
      defenseDate: 'December 15, 2025',
      defenseStage: 'Review Defense',
      score: 82,
    },
    {
      id: 2,
      title: 'AI-Powered Learning Management System for Remote Education',
      members: ['John Doe', 'Jane Smith', 'Mark Johnson'],
      adviser: 'Dr. Robert Lee',
      program: 'BS Computer Science',
      defenseDate: 'December 15, 2025',
      defenseStage: 'Title Defense',
      score: 92,
    },
    {
      id: 3,
      title: 'E-Commerce Platform for Local Agricultural Products',
      members: ['Anna Lee', 'Thomas Clark'],
      adviser: 'Dr. Maria Santos',
      program: 'BS Information Technology',
      defenseDate: 'December 16, 2025',
      defenseStage: 'Final Defense',
      score: 88,
    },
    {
      id: 4,
      title: 'IoT-Based Smart Campus Monitoring System',
      members: ['Pedro Cruz', 'Ana Reyes', 'Luis Garcia'],
      adviser: 'Dr. Carlos Rivera',
      program: 'BS Computer Engineering',
      defenseDate: 'December 18, 2025',
      defenseStage: 'Title Defense',
      score: 78,
    },
    {
      id: 5,
      title: 'NLP-Based Chatbot for Student Services',
      members: ['Rosa Lim', 'David Tan'],
      adviser: 'Dr. Robert Lee',
      program: 'BS Computer Science',
      defenseDate: 'December 20, 2025',
      defenseStage: 'Final Defense',
      score: 95,
    },
  ];

  const DEPARTMENTS = ['All Departments', 'BS Information Technology', 'BS Computer Science', 'BS Computer Engineering'];
  const STAGES = ['All Stages', 'Title Defense', 'Review Defense', 'Final Defense'];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Title Defense': return { bg: '#EBF5FB', text: '#2980B9' };
      case 'Review Defense': return { bg: '#FEF9E7', text: '#F39C12' };
      case 'Final Defense': return { bg: '#EAFAF1', text: '#27AE60' };
      default: return { bg: '#F2F3F4', text: '#7F8C8D' };
    }
  };

  // Fetch existing request for student
  useEffect(() => {
    if (user?.role === 'student_researcher') {
      fetchStudentRequest();
      fetchAdvisers();
    } else if (user?.role === 'adviser' || user?.role === 'dean') {
      fetchAdviserRequests();
    }
    setFetching(false);
  }, [user]);

  // Client-side filtering of adviser requests based on searchQuery and statusFilter
  const filteredRequests = adviserRequests.filter(req => {
    // 1. Filter by status
    if (statusFilter !== 'All') {
      const targetStatus = statusFilter === 'Return' ? 'rejected' : statusFilter.toLowerCase();
      if (req.status !== targetStatus) {
        return false;
      }
    }
    // 2. Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const title = (req.research_title || '').toLowerCase();
      const studentName = `${req.student?.first_name || ''} ${req.student?.last_name || ''}`.toLowerCase();
      const studentNo = (req.student?.student_number || '').toLowerCase();
      const area = (req.research_area || '').toLowerCase();
      const members = (req.group_members || '').toLowerCase();
      
      return title.includes(query) ||
             studentName.includes(query) ||
             studentNo.includes(query) ||
             area.includes(query) ||
             members.includes(query);
    }
    return true;
  });


  const fetchStudentRequest = async () => {
    try {
      const response = await adviserRequestApi.getAll();
      if (response.success && response.data.length > 0) {
        setExistingRequest(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch request:', error);
    }
  };

  const fetchAdvisers = async () => {
    try {
      const response = await adviserRequestApi.getAdvisers();
      if (response.success) {
        setAdvisers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch advisers:', error);
    }
  };

  const fetchAdviserRequests = async () => {
    try {
      const response = await adviserRequestApi.getAll();
      if (response.success) {
        setAdviserRequests(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch adviser requests:', error);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected', comment?: string) => {
    try {
      setLoading(true);
      await adviserRequestApi.updateStatus(id, {
        status,
        rejection_reason: comment || undefined
      });
      fetchAdviserRequests();
      alert(`Request ${status === 'rejected' ? 'returned' : status} successfully!`);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleResetStatus = async (id: number) => {
    try {
      setLoading(true);
      await adviserRequestApi.resetStatus(id);
      fetchAdviserRequests();
      alert('Request reset to pending successfully!');
    } catch (error) {
      console.error('Failed to reset status:', error);
      alert('Failed to reset status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setMessage(null);

      let docUrl = formData.documentUrl ? formData.documentUrl.trim() : '';
      if (docUrl && !/^https?:\/\//i.test(docUrl)) {
        docUrl = 'https://' + docUrl;
      }

      const payload: AdviserRequestPayload = {
        research_title: formData.researchTitle,
        research_area: formData.researchArea,
        research_objectives: formData.researchObjectives,
        group_members: formData.groupMembers,
        adviser_name: formData.preferredAdviser,
        adviser_email: formData.adviserEmail,
        expected_defense_date: formData.expectedDefenseDate,
        document_url: docUrl,
      };

      await adviserRequestApi.create(payload);

      setMessage({ type: 'success', text: 'Adviser Request Submitted successfully!' });
      fetchStudentRequest();
      setActiveTab('Submitted');

    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to submit request. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'My Dashboard':
        if (user?.role !== 'student_researcher') {
          return renderAdviserDashboard();
        } else {
          return renderStudentDashboard();
        }
      case 'Book a Defense':
        return renderBookDefense();
      case 'Submitted':
        return renderSubmittedRequests();
      case 'Results':
        return renderResults();
      case 'Profile':
        return renderProfile();
      default:
        return null;
    }
  };

  // Render Sub-Components
  const renderStudentDashboard = () => {
    return (
      <View style={{ width: '100%', maxWidth: 900, alignSelf: 'center' }}>
        {/* Welcome Banner */}
        <View style={[styles.card, { backgroundColor: '#1C64F2', padding: 30, marginBottom: 25, position: 'relative', overflow: 'hidden' }]}>
          <View style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
            <Ionicons name="school" size={150} color="#FFF" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 8 }}>
            Welcome back, {user?.first_name}!
          </Text>
          <Text style={{ fontSize: 14, color: '#EBF5FF', lineHeight: 20, maxWidth: 600 }}>
            Manage your research proposal acceptance forms, track reviewer feedback, and coordinate schedule times in real-time.
          </Text>
        </View>

        {/* Dashboard Progress Tracker */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 15 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2D3748' }}>Adviser Acceptance Progress</Text>
            <Text style={{ fontSize: 13, color: '#718096' }}>Track approval status of your research proposal documents.</Text>
          </View>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1C64F2',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              shadowColor: '#1C64F2',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 3
            }}
            onPress={() => {
              if (existingRequest && existingRequest.status !== 'rejected') {
                alert('You already have an active submission. Only one proposal is allowed at a time.');
              } else {
                if (existingRequest && existingRequest.status === 'rejected') {
                  setFormData({
                    yearLevel: existingRequest.student?.grade_level || user?.grade_level || '3rd Year - 2nd Semester',
                    contactNumber: existingRequest.student?.phone_number || user?.phone_number || '',
                    emailAddress: existingRequest.student?.email || user?.email || '',
                    researchTitle: existingRequest.research_title || '',
                    researchArea: existingRequest.research_area || '',
                    preferredAdviser: existingRequest.adviser_name || '',
                    adviserEmail: existingRequest.adviser_email || '',
                    groupMembers: existingRequest.group_members || '',
                    researchObjectives: existingRequest.research_objectives || '',
                    expectedDefenseDate: existingRequest.expected_defense_date || '',
                    documentUrl: existingRequest.document_url || '',
                  });
                }
                setShowSubmitModal(true);
              }
            }}
          >
            <Ionicons name="add-circle-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>Submit to Adviser</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Status Section */}
        {existingRequest ? (
          <View style={{ gap: 20 }}>
            {/* Timeline Progress Card */}
            <View style={styles.card}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#4A5568', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 }}>Submission Timeline</Text>

              <View style={{ gap: 15 }}>
                {/* Step 1: Draft / Submitted */}
                <View style={{ flexDirection: 'row', gap: 15 }}>
                  <View style={{ alignItems: 'center' }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', zIndex: 2 }}>
                      <Ionicons name="checkmark" size={16} color="#059669" />
                    </View>
                    <View style={{ width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: -4 }} />
                  </View>
                  <View style={{ flex: 1, paddingBottom: 15 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2D3748' }}>Proposal Submitted</Text>
                    <Text style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>Form UNC-FM-RC-31 saved to database & email notification sent to adviser.</Text>
                    <Text style={{ fontSize: 11, color: '#A0AEC0', marginTop: 4 }}>{new Date(existingRequest.created_at).toLocaleString()}</Text>
                  </View>
                </View>

                {/* Step 2: Adviser Review */}
                <View style={{ flexDirection: 'row', gap: 15 }}>
                  <View style={{ alignItems: 'center' }}>
                    <View style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: existingRequest.status === 'pending' ? '#FEF3C7' : existingRequest.status === 'approved' ? '#D1FAE5' : '#FEE2E2',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 2
                    }}>
                      <Ionicons
                        name={existingRequest.status === 'pending' ? 'time' : existingRequest.status === 'approved' ? 'checkmark' : 'close'}
                        size={16}
                        color={existingRequest.status === 'pending' ? '#D97706' : existingRequest.status === 'approved' ? '#059669' : '#DC2626'}
                      />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2D3748' }}>
                      Adviser Decision: {existingRequest.status === 'approved' ? 'ADVISER APPROVED' : existingRequest.status === 'rejected' ? 'RETURNED' : existingRequest.status.toUpperCase()}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>
                      {existingRequest.status === 'pending'
                        ? `Awaiting review by ${existingRequest.adviser_name}.`
                        : existingRequest.status === 'approved'
                          ? `Approved by ${existingRequest.adviser_name}. You are now ready to schedule a defense!`
                          : `Returned by ${existingRequest.adviser_name}. Reason: ${existingRequest.rejection_reason || 'Please contact your adviser.'}`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Document and Details Card */}
            <View style={styles.card}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#4A5568', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 }}>Submitted Proposal Documents</Text>

              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 5 }}>{existingRequest.research_title}</Text>
              <Text style={{ fontSize: 13, color: '#718096', marginBottom: 15 }}>Field: <Text style={{ fontWeight: '600' }}>{existingRequest.research_area}</Text></Text>

              {existingRequest.document_url ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4FE', padding: 15, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#1C64F2', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 200 }}>
                    <Ionicons name="document-text" size={24} color="#1C64F2" style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1E40AF' }}>Research Proposal Draft (Submitted)</Text>
                      <Text style={{ fontSize: 12, color: '#3B82F6', textDecorationLine: 'underline' }} numberOfLines={1}>{existingRequest.document_url}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={{ backgroundColor: '#1C64F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                    onPress={() => openDocumentLink(existingRequest.document_url)}
                  >
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold' }}>View Document</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ backgroundColor: '#FFF5F5', padding: 15, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#EF4444' }}>
                  <Text style={{ fontSize: 13, color: '#EF4444', fontWeight: 'bold' }}>No document link was uploaded.</Text>
                </View>
              )}
            </View>
            {existingRequest.status === 'rejected' && (
              <View style={{
                backgroundColor: '#FFFBEB',
                borderColor: '#FDE68A',
                borderWidth: 1,
                padding: 20,
                borderRadius: 12,
                marginTop: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 15
              }}>
                <View style={{ flex: 1, minWidth: 250 }}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#B45309', marginBottom: 4 }}>Proposal Returned</Text>
                  <Text style={{ fontSize: 13, color: '#D97706', lineHeight: 18 }}>You can review the adviser's feedback, update your information, and re-submit the acceptance form.</Text>
                </View>
                <TouchableOpacity
                  style={{ backgroundColor: '#D97706', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => {
                    setFormData({
                      yearLevel: existingRequest.student?.grade_level || user?.grade_level || '3rd Year - 2nd Semester',
                      contactNumber: existingRequest.student?.phone_number || user?.phone_number || '',
                      emailAddress: existingRequest.student?.email || user?.email || '',
                      researchTitle: existingRequest.research_title || '',
                      researchArea: existingRequest.research_area || '',
                      preferredAdviser: existingRequest.adviser_name || '',
                      adviserEmail: existingRequest.adviser_email || '',
                      groupMembers: existingRequest.group_members || '',
                      researchObjectives: existingRequest.research_objectives || '',
                      expectedDefenseDate: existingRequest.expected_defense_date || '',
                      documentUrl: existingRequest.document_url || '',
                    });
                    setShowSubmitModal(true);
                  }}
                >
                  <Ionicons name="refresh-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>Re-submit Form</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.card, { alignItems: 'center', padding: 50, backgroundColor: '#FFF' }]}>
            <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
              <Ionicons name="document-attach-outline" size={32} color="#9CA3AF" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2D3748' }}>No Proposal Submissions Yet</Text>
            <Text style={{ fontSize: 13, color: '#718096', textAlign: 'center', marginTop: 8, maxWidth: 450, marginBottom: 25, lineHeight: 20 }}>
              You haven't submitted any research proposals for adviser acceptance yet. Submit your proposal documents to notify your preferred adviser and begin the defense scheduling sequence.
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: '#1C64F2', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => setShowSubmitModal(true)}
            >
              <Ionicons name="add-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>Add Request Form</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modal Overlay containing the Adviser Request Form */}
        {showSubmitModal && (
          <View style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
          } as any}>
            <View style={{
              backgroundColor: '#FFF',
              borderRadius: 12,
              width: '100%',
              maxWidth: 750,
              maxHeight: '90%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 15,
              elevation: 10,
              overflow: 'hidden'
            }}>
              {/* Modal Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#EBF5FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <Ionicons name="document-text" size={20} color="#1C64F2" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3748' }}>Submit Proposal to Adviser</Text>
                    <Text style={{ fontSize: 11, color: '#718096' }}>Form UNC-FM-RC-31 | University Research Center</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowSubmitModal(false)} style={{ padding: 5 }}>
                  <Ionicons name="close-outline" size={24} color="#718096" />
                </TouchableOpacity>
              </View>

              {/* Scrollable Form Content */}
              <ScrollView style={{ padding: 20, maxHeight: 500 }}>
                {/* Form Fields */}
                <View style={styles.sectionHeader}>
                  <Ionicons name="person-outline" size={18} color="#1C64F2" />
                  <Text style={styles.sectionTitle}>Student Researcher Profile</Text>
                </View>

                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput style={[styles.input, styles.inputDisabled]} value={`${user?.first_name} ${user?.middle_name || ''} ${user?.last_name}`} editable={false} />
                  </View>
                  <View style={[styles.field, { flex: 1, marginLeft: 15 }]}>
                    <Text style={styles.label}>Student Number</Text>
                    <TextInput style={[styles.input, styles.inputDisabled]} value={user?.student_number} editable={false} />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1.5 }]}>
                    <Text style={styles.label}>Department</Text>
                    <TextInput style={[styles.input, styles.inputDisabled]} value={user?.department} editable={false} />
                  </View>
                  <View style={[styles.field, { flex: 1, marginLeft: 15 }]}>
                    <Text style={styles.label}>Course / Program</Text>
                    <TextInput style={[styles.input, styles.inputDisabled]} value={user?.course || ''} editable={false} />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1, marginRight: 15 }]}>
                    <Text style={styles.label}>Contact Number <Text style={styles.asterisk}>*</Text></Text>
                    <TextInput
                      style={styles.input}
                      placeholder="09XX XXX XXXX"
                      value={formData.contactNumber}
                      onChangeText={(text) => setFormData({ ...formData, contactNumber: text })}
                    />
                  </View>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>Email Address <Text style={styles.asterisk}>*</Text></Text>
                    <TextInput
                      style={styles.input}
                      placeholder="email@example.com"
                      value={formData.emailAddress}
                      onChangeText={(text) => setFormData({ ...formData, emailAddress: text })}
                    />
                  </View>
                </View>

                <View style={[styles.divider, { marginVertical: 15 }]} />

                <View style={styles.sectionHeader}>
                  <Ionicons name="document-text-outline" size={18} color="#1C64F2" />
                  <Text style={styles.sectionTitle}>Research Proposal Details</Text>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Research Title <Text style={styles.asterisk}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your research title"
                    value={formData.researchTitle}
                    onChangeText={(text) => setFormData({ ...formData, researchTitle: text })}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Research Area / Field <Text style={styles.asterisk}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Artificial Intelligence, Data Science"
                    value={formData.researchArea}
                    onChangeText={(text) => setFormData({ ...formData, researchArea: text })}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Proposal Link (Google Drive / Shared Link) <Text style={styles.asterisk}>*</Text></Text>
                  <View style={styles.inputWithIcon}>
                    <Ionicons name="link-outline" size={18} color="#A0AEC0" style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.inputInner}
                      placeholder="https://drive.google.com/file/d/..."
                      value={formData.documentUrl}
                      onChangeText={(text) => setFormData({ ...formData, documentUrl: text })}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1, marginRight: 15 }]}>
                    <Text style={styles.label}>Preferred Adviser <Text style={styles.asterisk}>*</Text></Text>
                    <View style={{ borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 8, backgroundColor: '#FFF', height: 48, justifyContent: 'center' }}>
                      <Picker
                        selectedValue={formData.adviserEmail}
                        onValueChange={(itemValue) => {
                          const selected = advisers.find(adv => adv.email === itemValue);
                          if (selected) {
                            setFormData({
                              ...formData,
                              preferredAdviser: `${selected.first_name} ${selected.last_name}`,
                              adviserEmail: selected.email
                            });
                          } else {
                            setFormData({
                              ...formData,
                              preferredAdviser: '',
                              adviserEmail: ''
                            });
                          }
                        }}
                        style={{ height: 48, color: '#2D3748' }}
                      >
                        <Picker.Item label="Select Preferred Adviser" value="" color="#A0AEC0" />
                        {advisers.map(adv => (
                          <Picker.Item
                            key={adv.id}
                            label={`${adv.first_name} ${adv.last_name} (${adv.department || 'Adviser'})`}
                            value={adv.email}
                          />
                        ))}
                        {/* Static fallback in case DB list is empty */}
                        {advisers.length === 0 && (
                          <Picker.Item label="Maria Arka Danila (Computer Science)" value="maria.danila@unc.edu.ph" />
                        )}
                      </Picker>
                    </View>
                  </View>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>Adviser Email</Text>
                    <TextInput
                      style={[styles.input, styles.inputDisabled]}
                      value={formData.adviserEmail || 'No adviser selected'}
                      editable={false}
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Group Members (one researcher per line)</Text>
                  <TextInput
                    style={[styles.input, { height: 70, textAlignVertical: 'top', paddingTop: 8 }]}
                    multiline
                    placeholder="e.g. Pedro Cruz (Student Number)"
                    value={formData.groupMembers}
                    onChangeText={(text) => setFormData({ ...formData, groupMembers: text })}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Research Objectives</Text>
                  <TextInput
                    style={[styles.input, { height: 70, textAlignVertical: 'top', paddingTop: 8 }]}
                    multiline
                    placeholder="Briefly state key targets..."
                    value={formData.researchObjectives}
                    onChangeText={(text) => setFormData({ ...formData, researchObjectives: text })}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Expected Defense Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Midterms 2026"
                    value={formData.expectedDefenseDate}
                    onChangeText={(text) => setFormData({ ...formData, expectedDefenseDate: text })}
                  />
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', gap: 10 }}>
                <TouchableOpacity
                  style={{ backgroundColor: '#EF4444', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 }}
                  onPress={() => setShowSubmitModal(false)}
                >
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 }}
                  onPress={async () => {
                    if (!formData.researchTitle || !formData.preferredAdviser || !formData.adviserEmail || !formData.documentUrl) {
                      alert('Please complete all required fields (*).');
                      return;
                    }
                    await handleSubmit();
                    setShowSubmitModal(false);
                  }}
                >
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>Submit to Adviser</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const openDocumentLink = (url: string) => {
    if (!url) return;
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    Linking.openURL(formattedUrl).catch(err => {
      console.error("Couldn't load page", err);
      try {
        window.open(formattedUrl, '_blank');
      } catch (e) {
        alert('Failed to open link: ' + formattedUrl);
      }
    });
  };

  const renderAdviserDashboard = () => (
    <View style={{ width: '100%', maxWidth: 1000, alignSelf: 'center' }}>
      <Text style={[styles.cardTitle, { marginBottom: 20, fontSize: 24 }]}>Student Submissions</Text>

      {/* Search and Filter Section */}
      <View style={{
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
        alignItems: 'center',
        flexWrap: 'wrap',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
      }}>
        {/* Search Bar */}
        <View style={{ flex: 2, minWidth: 200, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 6, paddingHorizontal: 10, height: 40 }}>
          <Ionicons name="search-outline" size={18} color="#718096" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search by title, student, area, members..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, height: '100%', outlineStyle: 'none' as any, fontSize: 13, color: '#2D3748' }}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#A0AEC0" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Dropdown */}
        <View style={{ width: 180, minWidth: 150 }}>
          <View style={{ borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 6, backgroundColor: '#FFF', height: 40, justifyContent: 'center' }}>
            <Picker
              selectedValue={statusFilter}
              onValueChange={(itemValue) => setStatusFilter(itemValue)}
              style={{ height: 40, color: '#2D3748', fontSize: 13, borderStyle: 'none' as any }}
            >
              <Picker.Item label="All" value="All" />
              <Picker.Item label="Pending" value="Pending" />
              <Picker.Item label="Approved" value="Approved" />
              <Picker.Item label="Return" value="Return" />
            </Picker>
          </View>
        </View>
      </View>

      {filteredRequests.length === 0 ? (
        <View style={[styles.card, { alignItems: 'center', padding: 50 }]}>
          <Ionicons name="file-tray-outline" size={60} color="#CBD5E0" />
          <Text style={{ marginTop: 20, color: '#718096', fontSize: 16 }}>
            {adviserRequests.length === 0 ? 'No student submissions yet.' : 'No submissions match your filters.'}
          </Text>
        </View>
      ) : (
        filteredRequests.map((req) => (
          <View key={req.id} style={[styles.card, { marginBottom: 20 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: req.status === 'rejected' ? '#D97706' : '#1C64F2', fontWeight: 'bold', marginBottom: 5 }}>
                  {req.status === 'rejected' ? 'RETURNED' : req.status.toUpperCase()}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginBottom: 10 }}>{req.research_title}</Text>
                
                {/* Student Full Information Section */}
                <View style={{ backgroundColor: '#F8FAFC', padding: 15, borderRadius: 8, marginBottom: 15, borderLeftWidth: 3, borderLeftColor: '#3B82F6' }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1E293B', marginBottom: 10 }}>Student Profile & Contact Information</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
                    <View style={{ minWidth: 200, flex: 1 }}>
                      <Text style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>Full Name</Text>
                      <Text style={{ fontSize: 13, color: '#334155', fontWeight: '500', marginTop: 2 }}>
                        {req.student?.first_name} {req.student?.last_name}
                      </Text>
                    </View>
                    <View style={{ minWidth: 120, flex: 1 }}>
                      <Text style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>Student ID</Text>
                      <Text style={{ fontSize: 13, color: '#334155', fontWeight: '500', marginTop: 2 }}>
                        {req.student?.student_number || 'N/A'}
                      </Text>
                    </View>
                    <View style={{ minWidth: 180, flex: 1 }}>
                      <Text style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>Email Address</Text>
                      <Text style={{ fontSize: 13, color: '#334155', fontWeight: '500', marginTop: 2 }}>
                        {req.student?.email || 'N/A'}
                      </Text>
                    </View>
                    <View style={{ minWidth: 120, flex: 1 }}>
                      <Text style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>Contact Number</Text>
                      <Text style={{ fontSize: 13, color: '#334155', fontWeight: '500', marginTop: 2 }}>
                        {req.student?.phone_number || 'N/A'}
                      </Text>
                    </View>
                    <View style={{ minWidth: 150, flex: 1 }}>
                      <Text style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>Course / Program</Text>
                      <Text style={{ fontSize: 13, color: '#334155', fontWeight: '500', marginTop: 2 }}>
                        {req.student?.course || 'N/A'}
                      </Text>
                    </View>
                    <View style={{ minWidth: 150, flex: 1 }}>
                      <Text style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>Year & Semester</Text>
                      <Text style={{ fontSize: 13, color: '#334155', fontWeight: '500', marginTop: 2 }}>
                        {req.student?.grade_level || 'N/A'}
                      </Text>
                    </View>
                    <View style={{ minWidth: 120, flex: 1 }}>
                      <Text style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>Department</Text>
                      <Text style={{ fontSize: 13, color: '#334155', fontWeight: '500', marginTop: 2 }}>
                        {req.student?.department || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Research Objectives Section */}
                <View style={{ backgroundColor: '#F8FAFC', padding: 15, borderRadius: 8, marginBottom: 15 }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#4A5568', marginBottom: 5 }}>Research Objectives:</Text>
                  <Text style={{ fontSize: 13, color: '#718096', lineHeight: 20 }}>{req.research_objectives || 'No objectives provided.'}</Text>
                </View>

                {/* Group Members Section */}
                <View style={{ backgroundColor: '#F8FAFC', padding: 15, borderRadius: 8, marginBottom: 15 }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#4A5568', marginBottom: 5 }}>Group Members:</Text>
                  <Text style={{ fontSize: 13, color: '#718096', lineHeight: 20 }}>{req.group_members || 'No other group members listed.'}</Text>
                </View>

                {/* Document Link */}
                {req.document_url ? (
                  <View style={{ backgroundColor: '#EEF2FF', padding: 15, borderRadius: 8, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#4F46E5', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 200 }}>
                      <Ionicons name="document-text-outline" size={24} color="#4F46E5" style={{ marginRight: 10 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#3730A3' }}>Research Proposal Document</Text>
                        <Text style={{ fontSize: 12, color: '#4F46E5', textDecorationLine: 'underline' }} numberOfLines={1}>{req.document_url}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={{ backgroundColor: '#4F46E5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                      onPress={() => openDocumentLink(req.document_url)}
                    >
                      <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold' }}>Open Document</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ backgroundColor: '#FFF5F5', padding: 15, borderRadius: 8, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#EF4444', flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="warning-outline" size={20} color="#EF4444" style={{ marginRight: 10 }} />
                    <Text style={{ fontSize: 13, color: '#9B1C1C', fontWeight: '500' }}>No document link was submitted by the student.</Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <View style={{ marginRight: 30, marginBottom: 10 }}>
                    <Text style={{ fontSize: 12, color: '#A0AEC0' }}>Research Area</Text>
                    <Text style={{ fontSize: 14, color: '#2D3748', fontWeight: '500' }}>{req.research_area}</Text>
                  </View>
                  <View style={{ marginRight: 30, marginBottom: 10 }}>
                    <Text style={{ fontSize: 12, color: '#A0AEC0' }}>Expected Defense</Text>
                    <Text style={{ fontSize: 14, color: '#2D3748', fontWeight: '500' }}>{req.expected_defense_date || 'TBA'}</Text>
                  </View>
                  <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 12, color: '#A0AEC0' }}>Department</Text>
                    <Text style={{ fontSize: 14, color: '#2D3748', fontWeight: '500' }}>{req.student?.department}</Text>
                  </View>
                </View>
              </View>
            </View>

            {user?.role === 'adviser' && req.status === 'pending' && (
              <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 15, width: '100%' }}>
                <Text style={{ fontSize: 14, color: '#4A5568', marginBottom: 8, fontWeight: 'bold' }}>Adviser Evaluation</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 10, marginBottom: 15 }]}
                  multiline
                  placeholder="Enter your feedback or reason for returning the proposal (optional)..."
                  value={reviewComments[req.id] || ''}
                  onChangeText={(text) => setReviewComments(prev => ({ ...prev, [req.id]: text }))}
                />
                <View style={{ flexDirection: 'row', gap: 15 }}>
                  <TouchableOpacity
                    style={{ backgroundColor: '#10B981', flex: 1, paddingVertical: 12, borderRadius: 6, alignItems: 'center' }}
                    onPress={() => handleUpdateStatus(req.id, 'approved', reviewComments[req.id])}
                  >
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>Approve Request</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: '#EF4444', flex: 1, paddingVertical: 12, borderRadius: 6, alignItems: 'center' }}
                    onPress={() => handleUpdateStatus(req.id, 'rejected', reviewComments[req.id])}
                  >
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>Return Request</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderBookDefense = () => {
    const slotsDay1 = [
      { id: 1, time: '8:00 AM - 10:00 AM', room: 'Room 101 - SCIS Building', day: 'Tuesday, May 19, 2026' },
      { id: 2, time: '8:00 AM - 10:00 AM', room: 'Room 102 - SCIS Building', day: 'Tuesday, May 19, 2026' },
      { id: 3, time: '8:00 AM - 10:00 AM', room: 'Room 201 - SCIS Building', day: 'Tuesday, May 19, 2026' },
      { id: 4, time: '8:00 AM - 10:00 AM', room: 'Conference Room A', day: 'Tuesday, May 19, 2026' },
      { id: 5, time: '8:00 AM - 10:00 AM', room: 'Conference Room B', day: 'Tuesday, May 19, 2026' },
      { id: 6, time: '10:00 AM - 12:00 PM', room: 'Room 101 - SCIS Building', day: 'Tuesday, May 19, 2026' },
    ];

    const slotsDay2 = [
      { id: 7, time: '8:00 AM - 10:00 AM', room: 'Room 101 - SCIS Building', day: 'Wednesday, May 20, 2026' },
      { id: 8, time: '8:00 AM - 10:00 AM', room: 'Room 102 - SCIS Building', day: 'Wednesday, May 20, 2026' },
      { id: 9, time: '8:00 AM - 10:00 AM', room: 'Room 201 - SCIS Building', day: 'Wednesday, May 20, 2026' },
      { id: 10, time: '10:00 AM - 12:00 PM', room: 'Room 102 - SCIS Building', day: 'Wednesday, May 20, 2026' },
      { id: 11, time: '1:00 PM - 3:00 PM', room: 'Room 201 - SCIS Building', day: 'Wednesday, May 20, 2026' },
    ];

    if (!existingRequest || existingRequest.status !== 'approved') {
      return (
        <View style={{ width: '100%', maxWidth: 700, alignSelf: 'center', gap: 20, marginTop: 40 }}>
          <View style={{
            backgroundColor: '#FFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            padding: 40,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 3,
            gap: 20
          }}>
            {/* Lock Icon */}
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#FEF3C7', // Soft orange background
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Ionicons name="lock-closed-outline" size={40} color="#D97706" />
            </View>

            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' }}>
              Defense Booking Locked
            </Text>

            <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, maxWidth: 500 }}>
              You must first submit your research proposal to your preferred adviser and receive official <Text style={{ fontWeight: 'bold', color: '#1E293B' }}>Adviser Approval</Text> before you can book academic defense time slots.
            </Text>

            <View style={{
              width: '100%',
              backgroundColor: '#F8FAFC',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              padding: 16,
              marginTop: 10,
              gap: 8
            }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Current Request Status:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{
                  backgroundColor: !existingRequest ? '#F1F5F9' : existingRequest.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: !existingRequest ? '#475569' : existingRequest.status === 'pending' ? '#B45309' : '#B91C1C'
                  }}>
                    {!existingRequest ? 'No Proposal Submitted' : existingRequest.status === 'pending' ? 'Pending Adviser Decision' : 'Returned / Re-upload Required'}
                  </Text>
                </View>
              </View>
              {existingRequest?.status === 'pending' && (
                <Text style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                  Your proposal <Text style={{ fontStyle: 'italic', fontWeight: '500' }}>"{existingRequest.research_title}"</Text> is currently under evaluation by <Text style={{ fontWeight: '600' }}>Dr. {existingRequest.preferred_adviser || existingRequest.adviser_name}</Text>.
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: '#C8102E', // UNC Red Brand
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
                marginTop: 15,
              }}
              onPress={() => setActiveTab('My Dashboard')}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={{ width: '100%', maxWidth: 1000, alignSelf: 'center', gap: 20 }}>
        {/* Help Banner / Instructions */}
        <View style={{
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
          borderWidth: 1,
          borderRadius: 8,
          padding: 20,
          flexDirection: 'row',
          gap: 15,
          alignItems: 'flex-start'
        }}>
          <Ionicons name="information-circle" size={24} color="#1C64F2" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 6 }}>How to book a defense:</Text>
            <Text style={{ fontSize: 13, color: '#1E40AF', marginBottom: 4 }}>1. Browse available date and time slots below</Text>
            <Text style={{ fontSize: 13, color: '#1E40AF', marginBottom: 4 }}>2. Click on your preferred slot to open the booking form</Text>
            <Text style={{ fontSize: 13, color: '#1E40AF', marginBottom: 4 }}>3. Fill in your defense details (title, type, researchers)</Text>
            <Text style={{ fontSize: 13, color: '#1E40AF' }}>4. Submit your request for coordinator approval</Text>
          </View>
        </View>

        {/* Section Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
          <Ionicons name="calendar-outline" size={24} color="#2D3748" />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2D3748' }}>Available Time Slots</Text>
        </View>

        {/* Date Group 1 */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 }}>
            <Ionicons name="calendar" size={18} color="#1C64F2" />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3748' }}>Tuesday, May 19, 2026</Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {slotsDay1.map(slot => (
              <TouchableOpacity
                key={slot.id}
                style={{
                  flex: 1,
                  minWidth: 260,
                  backgroundColor: '#FFF',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  borderRadius: 8,
                  padding: 15,
                  hoverStyle: { borderColor: '#1C64F2' }
                } as any}
                onPress={() => {
                  setSelectedSlot(slot);
                  setBookingModalVisible(true);
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="time-outline" size={16} color="#1C64F2" />
                    <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#2D3748' }}>{slot.time}</Text>
                  </View>
                  <View style={{ backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#065F46' }}>Available</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="location-outline" size={16} color="#718096" />
                  <Text style={{ fontSize: 13, color: '#718096' }}>{slot.room}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ fontSize: 13, color: '#718096', textAlign: 'center', marginTop: 15 }}>+14 more slots available for this day</Text>
        </View>

        {/* Date Group 2 */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 }}>
            <Ionicons name="calendar" size={18} color="#1C64F2" />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3748' }}>Wednesday, May 20, 2026</Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {slotsDay2.map(slot => (
              <TouchableOpacity
                key={slot.id}
                style={{
                  flex: 1,
                  minWidth: 260,
                  backgroundColor: '#FFF',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  borderRadius: 8,
                  padding: 15
                }}
                onPress={() => {
                  setSelectedSlot(slot);
                  setBookingModalVisible(true);
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="time-outline" size={16} color="#1C64F2" />
                    <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#2D3748' }}>{slot.time}</Text>
                  </View>
                  <View style={{ backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#065F46' }}>Available</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="location-outline" size={16} color="#718096" />
                  <Text style={{ fontSize: 13, color: '#718096' }}>{slot.room}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mock Scheduling Booking Modal Overlay */}
        {bookingModalVisible && selectedSlot && (
          <View style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
          } as any}>
            <View style={{
              backgroundColor: '#FFF',
              borderRadius: 12,
              width: '100%',
              maxWidth: 550,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 15,
              elevation: 10,
              overflow: 'hidden'
            }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name="time" size={20} color="#1C64F2" />
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3748' }}>Book Defense Appointment Slot</Text>
                </View>
                <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                  <Ionicons name="close-outline" size={24} color="#718096" />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <View style={{ padding: 20, gap: 15 }}>
                <View style={{ backgroundColor: '#F0F4FE', padding: 12, borderRadius: 8, gap: 5 }}>
                  <Text style={{ fontSize: 12, color: '#718096' }}>Selected Slot Details:</Text>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1E3A8A' }}>📅 {selectedSlot.day} | ⏰ {selectedSlot.time}</Text>
                  <Text style={{ fontSize: 13, color: '#1E40AF' }}>📍 {selectedSlot.room}</Text>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Defense Stage Type:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={mockBookingData.defenseType}
                      onValueChange={(val) => setMockBookingData({ ...mockBookingData, defenseType: val })}
                      style={styles.picker}
                    >
                      <Picker.Item label="Title Defense" value="Title Defense" />
                      <Picker.Item label="Review Defense" value="Review Defense" />
                      <Picker.Item label="Final Defense" value="Final Defense" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Research Title <Text style={styles.asterisk}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your approved proposal title"
                    value={mockBookingData.title}
                    onChangeText={(val) => setMockBookingData({ ...mockBookingData, title: val })}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Co-Researchers / Group Members:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Maria Cruz, Sarah Williams"
                    value={mockBookingData.members}
                    onChangeText={(val) => setMockBookingData({ ...mockBookingData, members: val })}
                  />
                </View>
              </View>

              {/* Footer */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', gap: 10 }}>
                <TouchableOpacity
                  style={{ backgroundColor: '#EF4444', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 }}
                  onPress={() => setBookingModalVisible(false)}
                >
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 }}
                  onPress={() => {
                    if (!mockBookingData.title) {
                      alert('Please provide your research title.');
                      return;
                    }
                    alert(`Your booking request for '${mockBookingData.defenseType}' on ${selectedSlot.day} has been submitted! Sent to coordinator.`);
                    setBookingModalVisible(false);
                  }}
                >
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>Submit Request</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderSubmittedRequests = () => {
    if (user?.role !== 'student_researcher') {
      return (
        <View style={{ width: '100%', maxWidth: 1000, alignSelf: 'center' }}>
          <Text style={[styles.cardTitle, { marginBottom: 20, fontSize: 24 }]}>Submission History & Analytics</Text>
          <View style={styles.card}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 15 }}>Processed Requests</Text>
            {adviserRequests.map((req) => (
              <View key={req.id} style={{ borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: '#2D3748' }}>{req.research_title}</Text>
                  <Text style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>
                    Student: {req.student?.first_name} {req.student?.last_name} | Adviser: {req.adviser_name}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {req.status !== 'pending' && (
                    <TouchableOpacity
                      style={{ backgroundColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
                      onPress={() => handleResetStatus(req.id)}
                    >
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#FFF' }}>Reset to Pending</Text>
                    </TouchableOpacity>
                  )}
                  <View style={{ backgroundColor: req.status === 'approved' ? '#D1FAE5' : req.status === 'rejected' ? '#FFEFE2' : '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: req.status === 'approved' ? '#065F46' : req.status === 'rejected' ? '#D97706' : '#92400E' }}>
                      {req.status === 'rejected' ? 'RETURNED' : req.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            {adviserRequests.length === 0 && (
              <Text style={{ color: '#718096', textAlign: 'center', marginVertical: 20 }}>No request submissions processed yet.</Text>
            )}
          </View>
        </View>
      );
    }

    if (!existingRequest) {
      return (
        <View style={{ width: '100%', maxWidth: 900, alignSelf: 'center' }}>
          <View style={[styles.card, { alignItems: 'center', padding: 50, backgroundColor: '#FFF' }]}>
            <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
              <Ionicons name="paper-plane-outline" size={32} color="#A0AEC0" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2D3748' }}>No Submission Logs Found</Text>
            <Text style={{ fontSize: 13, color: '#718096', textAlign: 'center', marginTop: 8, maxWidth: 450, marginBottom: 25, lineHeight: 20 }}>
              You haven't initiated any proposal documents or adviser acceptance workflows yet.
            </Text>
            <TouchableOpacity
              style={[styles.submitBtn]}
              onPress={() => setActiveTab('My Dashboard')}
            >
              <Text style={styles.submitBtnText}>Go to My Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={{ width: '100%', maxWidth: 900, alignSelf: 'center', gap: 20 }}>
        {/* Submissions Summary Card */}
        <View style={styles.card}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginBottom: 15 }}>Submission History Logs</Text>
          <Text style={{ fontSize: 13, color: '#718096', marginBottom: 20 }}>Chronological history of research adviser actions, forms, and documents.</Text>

          {/* Timeline list */}
          <View style={{ gap: 20 }}>
            {/* Log 3: Adviser Decision */}
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: existingRequest.status === 'pending' ? '#FEF3C7' : existingRequest.status === 'approved' ? '#D1FAE5' : '#FEE2E2',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Ionicons
                    name={existingRequest.status === 'pending' ? 'eye-outline' : existingRequest.status === 'approved' ? 'checkbox-outline' : 'close-circle-outline'}
                    size={16}
                    color={existingRequest.status === 'pending' ? '#D97706' : existingRequest.status === 'approved' ? '#059669' : '#DC2626'}
                  />
                </View>
                <View style={{ width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 4 }} />
              </View>
              <View style={{ flex: 1, paddingBottom: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2D3748' }}>Adviser Review Stage</Text>
                <Text style={{ fontSize: 13, color: '#4A5568', marginTop: 4 }}>
                  {existingRequest.status === 'pending'
                    ? `Form UNC-FM-RC-31 is under active evaluation by Dr. ${existingRequest.preferred_adviser || existingRequest.adviser_name}.`
                    : existingRequest.status === 'approved'
                      ? `Request approved by Dr. ${existingRequest.preferred_adviser || existingRequest.adviser_name}. Adviser Acceptance confirmed.`
                      : `Returned by Dr. ${existingRequest.preferred_adviser || existingRequest.adviser_name}. Reason: ${existingRequest.rejection_reason || 'Re-upload requested.'}`}
                </Text>
                <Text style={{ fontSize: 11, color: '#A0AEC0', marginTop: 6 }}>Status Code: {existingRequest.status === 'rejected' ? 'RETURNED' : existingRequest.status.toUpperCase()}</Text>
              </View>
            </View>

            {/* Log 2: Automated Email Dispatch */}
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#EBF5FF', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="mail-open-outline" size={16} color="#1C64F2" />
                </View>
                <View style={{ width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 4 }} />
              </View>
              <View style={{ flex: 1, paddingBottom: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2D3748' }}>Email Notification Dispatched</Text>
                <Text style={{ fontSize: 13, color: '#4A5568', marginTop: 4 }}>
                  Laravel backend mailer dispatched E-Defense Request Alert containing document review links to <Text style={{ fontWeight: '600' }}>{existingRequest.adviser_email}</Text>.
                </Text>
                <Text style={{ fontSize: 11, color: '#A0AEC0', marginTop: 6 }}>Recipient: {existingRequest.adviser_email} | Template: UNC-FM-RC-31</Text>
              </View>
            </View>

            {/* Log 1: Form Creation */}
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="document-text-outline" size={16} color="#059669" />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2D3748' }}>Proposal Registered & Document Attached</Text>
                <Text style={{ fontSize: 13, color: '#4A5568', marginTop: 4 }}>
                  Research Title: "{existingRequest.research_title}"
                </Text>
                <Text style={{ fontSize: 13, color: '#4A5568', marginTop: 2 }}>
                  Drive Link: <Text style={{ color: '#1C64F2', textDecorationLine: 'underline' }}>{existingRequest.document_url}</Text>
                </Text>
                <Text style={{ fontSize: 11, color: '#A0AEC0', marginTop: 6 }}>Submitted At: {new Date(existingRequest.created_at).toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderAdviserResults = () => {
    if (selectedResultGroup) {
      return (
        <View style={{ width: '100%', maxWidth: 900, alignSelf: 'center', gap: 20 }}>
          <TouchableOpacity onPress={() => setSelectedResultGroup(null)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Ionicons name="arrow-back" size={20} color="#1C64F2" />
            <Text style={{ color: '#1C64F2', marginLeft: 8, fontWeight: 'bold' }}>Back to Advisees</Text>
          </TouchableOpacity>
          <Text style={[styles.cardTitle, { marginBottom: 5, fontSize: 24 }]}>{selectedResultGroup.research_title}</Text>
          <Text style={{ fontSize: 14, color: '#718096', marginBottom: 15 }}>Submitted by: {selectedResultGroup.student?.first_name} {selectedResultGroup.student?.last_name}</Text>

          <View style={styles.card}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 10 }}>Group Members</Text>
            <Text style={{ fontSize: 14, color: '#4A5568' }}>{selectedResultGroup.group_members || 'No other members listed.'}</Text>
          </View>

          <View style={styles.card}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 10 }}>Research Progress & Document</Text>
            {selectedResultGroup.document_url ? (
              <TouchableOpacity onPress={() => openDocumentLink(selectedResultGroup.document_url)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4FE', padding: 15, borderRadius: 8, marginBottom: 15 }}>
                <Ionicons name="document-text" size={24} color="#1C64F2" style={{ marginRight: 10 }} />
                <Text style={{ color: '#1C64F2', fontWeight: '500', textDecorationLine: 'underline' }}>View Submitted Proposal Document</Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ fontSize: 14, color: '#718096', fontStyle: 'italic', marginBottom: 15 }}>No document provided.</Text>
            )}

            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#4A5568', marginBottom: 5 }}>Research Objectives:</Text>
            <Text style={{ fontSize: 14, color: '#4A5568', marginBottom: 15 }}>{selectedResultGroup.research_objectives || 'None provided.'}</Text>
          </View>

          {user?.role !== 'dean' && selectedResultGroup.status !== 'pending' && (
            <TouchableOpacity
              style={{ backgroundColor: '#F59E0B', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 }}
              onPress={() => {
                handleResetStatus(selectedResultGroup.id);
                setSelectedResultGroup(null);
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>Reset to Pending</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View style={{ width: '100%', maxWidth: 900, alignSelf: 'center', gap: 20 }}>
        <Text style={[styles.cardTitle, { marginBottom: 5, fontSize: 24 }]}>Advisees Progress Results</Text>
        <Text style={{ fontSize: 13, color: '#718096', marginBottom: 15 }}>Select a group to view their progress, members, and evaluate their proposal.</Text>

        {/* Search and Filter Section */}
        <View style={{
          flexDirection: 'row',
          gap: 15,
          marginBottom: 15,
          alignItems: 'center',
          flexWrap: 'wrap',
          backgroundColor: '#FFF',
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#E2E8F0',
        }}>
          {/* Search Bar */}
          <View style={{ flex: 2, minWidth: 200, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 6, paddingHorizontal: 10, height: 40 }}>
            <Ionicons name="search-outline" size={18} color="#718096" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search by title, student, area, members..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ flex: 1, height: '100%', outlineStyle: 'none' as any, fontSize: 13, color: '#2D3748' }}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#A0AEC0" />
              </TouchableOpacity>
            )}
          </View>

          {/* Status Dropdown */}
          <View style={{ width: 180, minWidth: 150 }}>
            <View style={{ borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 6, backgroundColor: '#FFF', height: 40, justifyContent: 'center' }}>
              <Picker
                selectedValue={statusFilter}
                onValueChange={(itemValue) => setStatusFilter(itemValue)}
                style={{ height: 40, color: '#2D3748', fontSize: 13, borderStyle: 'none' as any }}
              >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="Pending" value="Pending" />
                <Picker.Item label="Approved" value="Approved" />
                <Picker.Item label="Return" value="Return" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={{ gap: 15 }}>
          {filteredRequests.map(req => (
            <TouchableOpacity
              key={req.id}
              style={[styles.card, { borderLeftWidth: 4, borderLeftColor: req.status === 'approved' ? '#10B981' : req.status === 'pending' ? '#F59E0B' : '#EF4444' }]}
              onPress={() => {
                setSelectedResultGroup(req);
                setReviewComment(req.rejection_reason || '');
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 4 }}>{req.research_title}</Text>
                  <Text style={{ fontSize: 13, color: '#718096' }}>Members: {req.student?.first_name} {req.student?.last_name}{req.group_members ? `, ${req.group_members.substring(0, 30)}...` : ''}</Text>
                </View>
                <View style={{ backgroundColor: req.status === 'approved' ? '#D1FAE5' : req.status === 'pending' ? '#FEF3C7' : '#FEE2E2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginLeft: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: req.status === 'approved' ? '#065F46' : req.status === 'pending' ? '#92400E' : '#991B1B' }}>
                    {req.status === 'rejected' ? 'RETURNED' : req.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {filteredRequests.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#718096', marginTop: 20 }}>
              {adviserRequests.length === 0 ? 'No advisees or submissions found.' : 'No advisees match your filters.'}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderResults = () => {
    if (user?.role !== 'student_researcher') {
      return renderAdviserResults();
    }

    return (
      <View style={{ width: '100%', maxWidth: 900, alignSelf: 'center', gap: 20 }}>
        <Text style={[styles.cardTitle, { marginBottom: 5, fontSize: 24 }]}>SCIS Defense Stages Monitor</Text>
        <Text style={{ fontSize: 13, color: '#718096', marginBottom: 15 }}>Official evaluation records and panel scores across SCIS academic milestones.</Text>

        <View style={{ gap: 15 }}>
          {/* Stage 1: Title Defense */}
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: existingRequest?.status === 'approved' ? '#10B981' : '#F59E0B' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3748' }}>Stage 1: Title Defense Stage</Text>
                <Text style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>Evaluation of problem statement, scope, and adviser alignment.</Text>
              </View>
              <View style={{ backgroundColor: existingRequest?.status === 'approved' ? '#D1FAE5' : '#FEF3C7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: existingRequest?.status === 'approved' ? '#065F46' : '#92400E' }}>
                  {existingRequest?.status === 'approved' ? 'READY TO BOOK' : 'AWAITING ADVISER'}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, borderTopWidth: 1, borderTopColor: '#F7FAFC', paddingTop: 12 }}>
              <View>
                <Text style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 'bold', textTransform: 'uppercase' }}>Panel Score</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#4A5568', marginTop: 2 }}>— / 100</Text>
              </View>
              <View>
                <Text style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 'bold', textTransform: 'uppercase' }}>Verdict</Text>
                <Text style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>To Be Announced (TBA)</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 'bold', textTransform: 'uppercase' }}>Evaluators</Text>
                <Text style={{ fontSize: 13, color: '#4A5568', marginTop: 2 }}>SCIS Panel Committee</Text>
              </View>
            </View>
          </View>

          {/* Stage 2: Review Defense */}
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#E2E8F0', opacity: 0.85 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>Stage 2: Review Defense Stage</Text>
                <Text style={{ fontSize: 12, color: '#A0AEC0', marginTop: 4 }}>System prototype critique, database schema normalization, and module review.</Text>
              </View>
              <View style={{ backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096' }}>LOCKED</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, borderTopWidth: 1, borderTopColor: '#F7FAFC', paddingTop: 12 }}>
              <View>
                <Text style={{ fontSize: 11, color: '#CBD5E0', fontWeight: 'bold', textTransform: 'uppercase' }}>Panel Score</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#CBD5E0', marginTop: 2 }}>— / 100</Text>
              </View>
              <View>
                <Text style={{ fontSize: 11, color: '#CBD5E0', fontWeight: 'bold', textTransform: 'uppercase' }}>Verdict</Text>
                <Text style={{ fontSize: 13, color: '#CBD5E0', marginTop: 2 }}>Awaiting Title Approval</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: '#CBD5E0', fontWeight: 'bold', textTransform: 'uppercase' }}>Evaluators</Text>
                <Text style={{ fontSize: 13, color: '#CBD5E0', marginTop: 2 }}>SCIS Panel Committee</Text>
              </View>
            </View>
          </View>

          {/* Stage 3: Final Defense */}
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#E2E8F0', opacity: 0.85 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>Stage 3: Final Defense Stage</Text>
                <Text style={{ fontSize: 12, color: '#A0AEC0', marginTop: 4 }}>Final dissertation evaluation, project handoff, and source repository sign-off.</Text>
              </View>
              <View style={{ backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096' }}>LOCKED</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, borderTopWidth: 1, borderTopColor: '#F7FAFC', paddingTop: 12 }}>
              <View>
                <Text style={{ fontSize: 11, color: '#CBD5E0', fontWeight: 'bold', textTransform: 'uppercase' }}>Panel Score</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#CBD5E0', marginTop: 2 }}>— / 100</Text>
              </View>
              <View>
                <Text style={{ fontSize: 11, color: '#CBD5E0', fontWeight: 'bold', textTransform: 'uppercase' }}>Verdict</Text>
                <Text style={{ fontSize: 13, color: '#CBD5E0', marginTop: 2 }}>Awaiting Review Stage Approval</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: '#CBD5E0', fontWeight: 'bold', textTransform: 'uppercase' }}>Evaluators</Text>
                <Text style={{ fontSize: 13, color: '#CBD5E0', marginTop: 2 }}>SCIS Panel Committee</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderProfile = () => {
    // Dynamically retrieve user credentials or fallback to mockup defaults
    const fullName = user ? `${user.first_name} ${user.middle_name ? `${user.middle_name} ` : ''}${user.last_name}${user.suffix ? ` ${user.suffix}` : ''}` : 'Dalia Mae Miralles';
    const displayYear = user?.grade_level ? (user.grade_level.includes(' - ') ? user.grade_level.split(' - ')[0] : user.grade_level) : '3rd Year';
    const displayRole = user?.role === 'student_researcher' ? 'Student' : user?.role === 'adviser' ? 'Adviser' : user?.role === 'dean' ? 'Dean' : 'Student';
    const displayEmail = user?.email || 'daliamae.miralles@unc.edu.ph';
    const displaySchool = user?.department || 'School of Computer and Information Sciences';
    const displayCourse = user?.course || 'Bachelor of Science in Information Technology';
    const displayAdviser = (existingRequest && existingRequest.status === 'approved') ? (existingRequest.preferred_adviser || existingRequest.adviser_name) : 'None';
    const displayAccountId = user?.role === 'adviser' ? 'adviser-1' : user?.role === 'dean' ? 'dean-1' : (user?.student_number || 'student-1');

    const isStudent = user?.role === 'student_researcher';

    return (
      <View style={{ width: '100%', maxWidth: 1000, alignSelf: 'center', gap: 20 }}>
        {/* Header Title Section */}
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#0F172A', fontFamily: 'System' }}>Profile</Text>
          <Text style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>View and manage your profile information</Text>
        </View>

        {/* Card 1: Main User Profile Card */}
        <View style={{
          backgroundColor: '#FFF',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          padding: 30,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
          gap: 25
        }}>
          {/* Avatar and Info Header Section */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            {/* UNC Red Circle Avatar with white icon */}
            <View style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              backgroundColor: '#C8102E', // UNC Red Brand Color
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#C8102E',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
            }}>
              <Ionicons name="person" size={32} color="#FFF" />
            </View>

            {/* Stack: Name, Year/Position, Badge */}
            <View style={{ gap: 4, alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#0F172A' }}>{fullName}</Text>
              <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '500' }}>
                {isStudent ? displayYear : user?.role === 'adviser' ? 'Adviser' : user?.role === 'dean' ? 'Dean' : ''}
              </Text>
              <View style={{
                backgroundColor: '#F1F5F9', // Light gray background
                paddingHorizontal: 12,
                paddingVertical: 3,
                borderRadius: 12,
                marginTop: 4
              }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#475569' }}>User</Text>
              </View>
            </View>
          </View>

          {/* Details Grid (2 columns layout) */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginTop: 10 }}>
            {/* Column 1 (Left) */}
            <View style={{ flex: 1, minWidth: 280, gap: 16 }}>
              {/* Email Address */}
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="mail-outline" size={14} color="#64748B" />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569' }}>Email Address</Text>
                </View>
                <View style={{
                  backgroundColor: '#F8FAFC',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  borderRadius: 8,
                  height: 46,
                  justifyContent: 'center',
                  paddingHorizontal: 16
                }}>
                  <Text style={{ fontSize: 14, color: '#1E293B', fontWeight: '500' }}>{displayEmail}</Text>
                </View>
              </View>

              {isStudent ? (
                /* Course for Student */
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="school-outline" size={14} color="#64748B" />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569' }}>Course</Text>
                  </View>
                  <View style={{
                    backgroundColor: '#F8FAFC',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    borderRadius: 8,
                    height: 46,
                    justifyContent: 'center',
                    paddingHorizontal: 16
                  }}>
                    <Text style={{ fontSize: 14, color: '#1E293B', fontWeight: '500' }}>{displayCourse}</Text>
                  </View>
                </View>
              ) : (
                /* Department for Adviser */
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="business-outline" size={14} color="#64748B" />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569' }}>Department</Text>
                  </View>
                  <View style={{
                    backgroundColor: '#F8FAFC',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    borderRadius: 8,
                    height: 46,
                    justifyContent: 'center',
                    paddingHorizontal: 16
                  }}>
                    <Text style={{ fontSize: 14, color: '#1E293B', fontWeight: '500' }} numberOfLines={1}>{displaySchool}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Column 2 (Right) */}
            <View style={{ flex: 1, minWidth: 280, gap: 16 }}>
              {isStudent ? (
                /* School for Student */
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="business-outline" size={14} color="#64748B" />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569' }}>School</Text>
                  </View>
                  <View style={{
                    backgroundColor: '#F8FAFC',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    borderRadius: 8,
                    height: 46,
                    justifyContent: 'center',
                    paddingHorizontal: 16
                  }}>
                    <Text style={{ fontSize: 14, color: '#1E293B', fontWeight: '500' }} numberOfLines={1}>{displaySchool}</Text>
                  </View>
                </View>
              ) : (
                /* Role for Adviser */
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="briefcase-outline" size={14} color="#64748B" />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569' }}>Role</Text>
                  </View>
                  <View style={{
                    backgroundColor: '#F8FAFC',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    borderRadius: 8,
                    height: 46,
                    justifyContent: 'center',
                    paddingHorizontal: 16
                  }}>
                    <Text style={{ fontSize: 14, color: '#1E293B', fontWeight: '500' }}>Adviser</Text>
                  </View>
                </View>
              )}

              {isStudent ? (
                /* Adviser Assigned for Student */
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="person-outline" size={14} color="#64748B" />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569' }}>Adviser Assigned</Text>
                  </View>
                  <View style={{
                    backgroundColor: '#F8FAFC',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    borderRadius: 8,
                    height: 46,
                    justifyContent: 'center',
                    paddingHorizontal: 16
                  }}>
                    <Text style={{ fontSize: 14, color: '#1E293B', fontWeight: '500' }}>{displayAdviser}</Text>
                  </View>
                </View>
              ) : (
                /* Position for Adviser */
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="person-outline" size={14} color="#64748B" />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569' }}>Position</Text>
                  </View>
                  <View style={{
                    backgroundColor: '#F8FAFC',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    borderRadius: 8,
                    height: 46,
                    justifyContent: 'center',
                    paddingHorizontal: 16
                  }}>
                    <Text style={{ fontSize: 14, color: '#1E293B', fontWeight: '500' }}>Not specified</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Card 2: Account Information */}
        <View style={{
          backgroundColor: '#FFF',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          padding: 30,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
          gap: 18
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0F172A' }}>Account Information</Text>

          <View style={{ gap: 14, marginTop: 4 }}>
            {/* Account ID Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '500' }}>Account ID:</Text>
              <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: 'bold', fontFamily: 'monospace' }}>{displayAccountId}</Text>
            </View>

            {/* Account Type Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '500' }}>Account Type:</Text>
              <Text style={{ fontSize: 14, color: '#475569', fontWeight: 'bold' }}>{displayRole}</Text>
            </View>

            {/* Status Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '500' }}>Status:</Text>
              <Text style={{ fontSize: 14, color: '#16A34A', fontWeight: 'bold' }}>Active</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getHeaderConfig = (tab: string) => {
    switch (tab) {
      case 'My Dashboard':
        return {
          title: 'My Dashboard',
          subtitle: 'Overview of defense activities and research requests'
        };
      case 'Book a Defense':
      case 'Book a defense':
        return {
          title: 'Book a Defense',
          subtitle: 'Select available schedules and book your presentation'
        };
      case 'Submitted':
        return {
          title: 'Submitted Proposals',
          subtitle: 'Track status and review history of submitted works'
        };
      case 'Results':
        return {
          title: 'Evaluation Results',
          subtitle: 'View panel grading scores, rubrics, and feedback'
        };
      case 'Profile':
        return {
          title: 'User Profile',
          subtitle: 'Manage your account security and profile information'
        };
      default:
        return {
          title: tab,
          subtitle: 'UNC Research Defense System'
        };
    }
  };

  const headerConfig = getHeaderConfig(activeTab);

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarLogoContainer}>
          <View style={styles.logoCircle}>
            <Image source={UNCLogo} style={styles.sidebarLogo} resizeMode="contain" />
          </View>
          <View style={styles.sidebarBrandContainer}>
            <Text style={styles.sidebarBrandMain}>UNC Research</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.menuItem,
                activeTab === item.name && styles.menuItemActive
              ]}
              onPress={() => setActiveTab(item.name)}
            >
              <Ionicons
                name={item.icon as any}
                size={18}
                color={activeTab === item.name ? '#FFF' : '#9CA3AF'}
              />
              <Text style={[
                styles.menuItemText,
                activeTab === item.name && styles.menuItemTextActive
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Topbar */}
        <View style={styles.topbar}>
          <View style={styles.topbarLeft}>
            <Text style={styles.topbarTitle}>{headerConfig.title}</Text>
            <Text style={styles.topbarSubtitle}>{headerConfig.subtitle}</Text>
          </View>

          <View style={styles.topbarRight}>
            {/* Interactive Notification Bell */}
            <TouchableOpacity
              style={styles.notificationIcon}
              onPress={() => setShowNotifications(!showNotifications)}
            >
              <Ionicons name="notifications-outline" size={22} color="#4B5563" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* User Info */}
            <View style={styles.userSection}>
              <View style={styles.profileAvatar}>
                <Text style={styles.avatarText}>
                  {(user?.first_name?.[0] || 'U').toUpperCase()}
                </Text>
              </View>
              <View style={styles.userMeta}>
                <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
                <Text style={styles.userRole}>
                  {user?.role === 'student_researcher' ? 'Student' : user?.role === 'adviser' ? 'Adviser' : user?.role === 'dean' ? 'Dean' : 'User'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <Ionicons name="log-out-outline" size={16} color="#FFF" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Notification Dropdown Overlay */}
        {showNotifications && (
          <View style={{
            position: 'absolute',
            top: 70,
            right: 20,
            width: 380,
            maxHeight: 480,
            backgroundColor: '#FFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            zIndex: 9999,
            padding: 15
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F7FAFC', paddingBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="notifications" size={18} color="#1C64F2" />
                <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#2D3748' }}>Notifications</Text>
              </View>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllNotificationsAsRead}>
                  <Text style={{ fontSize: 12, color: '#1C64F2', fontWeight: '600' }}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {notifications.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    paddingVertical: 10,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor: item.read ? '#FFF' : '#F4F7FE',
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: item.read ? 'transparent' : '#E2E8F0'
                  }}
                  onPress={() => markNotificationAsRead(item.id)}
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: item.type === 'success' ? '#D1FAE5' : item.type === 'error' ? '#FEE2E2' : item.type === 'warning' ? '#FEF3C7' : '#EBF5FF',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Ionicons
                      name={item.icon || 'notifications-outline'}
                      size={16}
                      color={item.type === 'success' ? '#059669' : item.type === 'error' ? '#DC2626' : item.type === 'warning' ? '#D97706' : '#1C64F2'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={{ fontSize: 13, fontWeight: item.read ? '600' : '800', color: '#2D3748' }}>{item.title}</Text>
                      {!item.read && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#1C64F2', marginTop: 4 }} />}
                    </View>
                    <Text style={{ fontSize: 12, color: '#718096', marginTop: 2, lineHeight: 16 }}>{item.message}</Text>
                    <Text style={{ fontSize: 10, color: '#A0AEC0', marginTop: 4 }}>{item.time}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {notifications.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Ionicons name="notifications-off-outline" size={32} color="#CBD5E0" />
                  <Text style={{ color: '#718096', fontSize: 13, marginTop: 10 }}>No notifications at this time.</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={{
                marginTop: 10,
                paddingVertical: 8,
                alignItems: 'center',
                backgroundColor: '#F7FAFC',
                borderRadius: 6,
                borderWidth: 1,
                borderColor: '#E2E8F0'
              }}
              onPress={() => setShowNotifications(false)}
            >
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#4A5568' }}>Close Panel</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderTabContent()}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F4F5F7',
  },
  // Sidebar
  sidebar: {
    width: 240,
    backgroundColor: '#151515',
    paddingTop: 25,
    height: '100%',
  },
  sidebarLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 35,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarLogo: {
    width: 30,
    height: 30,
  },
  sidebarBrandContainer: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  sidebarBrandMain: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sidebarBrandSub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 1,
  },
  menuContainer: {
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 5,
  },
  menuItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuItemText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 15,
  },
  menuItemTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },

  // Main Content
  mainContent: {
    flex: 1,
    height: '100%',
  },
  topbar: {
    height: 70,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topbarLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  topbarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  topbarSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  topbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  profileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1C64F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userMeta: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
  },
  userRole: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  notificationIcon: {
    position: 'relative',
    padding: 5,
    marginRight: 10,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#E74C3C',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C0392B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },

  // Content
  scrollContent: {
    padding: 30,
    paddingBottom: 60,
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  alertTitle: {
    color: '#92400E',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  alertDesc: {
    color: '#92400E',
    fontSize: 13,
  },

  // Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  field: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 6,
  },
  asterisk: {
    color: '#E74C3C',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#2D3748',
    outlineStyle: 'none' as any,
  },
  inputDisabled: {
    backgroundColor: '#F7FAFC',
    color: '#A0AEC0',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 40,
  },
  inputInner: {
    flex: 1,
    fontSize: 13,
    color: '#2D3748',
    height: '100%',
    outlineStyle: 'none' as any,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    backgroundColor: '#FFF',
    height: 40,
    justifyContent: 'center',
  },
  picker: {
    height: 40,
    color: '#2D3748',
  },
  noteBox: {
    backgroundColor: '#EBF5FF',
    padding: 15,
    borderRadius: 6,
    marginTop: 10,
    marginBottom: 25,
  },
  noteText: {
    fontSize: 12,
    color: '#1C64F2',
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  draftBtn: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginRight: 10,
  },
  draftBtnText: {
    color: '#4A5568',
    fontSize: 13,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#1C64F2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
  },
});
