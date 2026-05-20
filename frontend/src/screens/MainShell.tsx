import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  Modal,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import DashboardScreen from './Dashboard';
import RubricsScreen from './RubricsScreen';
import ResultsScreen from './ResultsScreen';
import ProfileScreen from './ProfileScreen';
import ScheduleScreen from './ScheduleScreen';
import { colors } from '../theme/tokens';
import { useApp } from '../context/AppContext';

const MD_MIN = 768;
const SIDEBAR_BG = '#212121';

export default function MainShell() {
  const params = useLocalSearchParams();
  const { user, logout } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = width >= MD_MIN;

  const [activeNavId, setActiveNavId] = useState('schedule');
  const [drawerOpen, setDrawerOpen] = useState(false);

  React.useEffect(() => {
    if (params?.activeNavId) {
      setActiveNavId(params.activeNavId);
    }
  }, [params?.activeNavId]);


  const onNavigate = useCallback(
    (navId) => {
      setActiveNavId(navId);
      if (!isDesktop) setDrawerOpen(false);
    },
    [isDesktop]
  );

  const onToggleSidebar = useCallback(() => {
    setDrawerOpen((o) => !o);
  }, []);

  return (
    <View style={styles.root}>
      <TopNav currentUser={user} onToggleSidebar={onToggleSidebar} onLogout={logout} />

      <View style={styles.row}>
        {isDesktop ? (
          <Sidebar active={activeNavId} onNavigate={onNavigate} />
        ) : null}

        <View style={styles.main} accessibilityRole="main">
          {activeNavId === 'schedule' ? <ScheduleScreen onNavigate={onNavigate} /> : null}
          {activeNavId === 'evaluation' ? <DashboardScreen /> : null}
          {activeNavId === 'rubrics' ? <RubricsScreen /> : null}
          {activeNavId === 'results' ? <ResultsScreen /> : null}
          {activeNavId === 'profile' ? <ProfileScreen /> : null}
        </View>
      </View>

      {!isDesktop ? (
        <Modal
          visible={drawerOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setDrawerOpen(false)}
        >
          <View style={styles.modalRoot}>
            <View style={[styles.drawer, { backgroundColor: SIDEBAR_BG }]} accessibilityViewIsModal>
              <Sidebar active={activeNavId} onNavigate={onNavigate} isMobile />
            </View>
            <Pressable style={styles.backdrop} onPress={() => setDrawerOpen(false)} accessibilityLabel="Close menu" />
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.pageBg },
  row: { flex: 1, flexDirection: 'row' },
  main: { flex: 1, minWidth: 0 },
  modalRoot: { flex: 1, flexDirection: 'row' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },
  drawer: {
    width: '82%',
    maxWidth: 280,
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: -2, height: 0 },
    elevation: 8,
  },
});
