import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  TouchableOpacity, 
  SafeAreaView, 
  RefreshControl, 
  Animated, 
  StatusBar,
  Dimensions 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { useLeads } from '../hooks/useLeads';
import { Lead } from '../types/lead';
import { Button } from '../components/ui/Button';
import { PermissionService } from '../lib/permissions';
import { LeadsStackParamList } from '../navigation/types';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

type LeadsScreenNavigationProp = StackScreenProps<LeadsStackParamList, 'LeadsList'>['navigation'];

const LeadsScreen = () => {
  const navigation = useNavigation<LeadsScreenNavigationProp>();
  const { user } = useAuth();
  const { leads, loading, error, fetchLeads, deleteLead } = useLeads();
  const permissionService = PermissionService.getInstance();

  const [refreshing, setRefreshing] = useState(false);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const canCreateLeads = permissionService.hasPermission(user, 'leads', 'create');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeads('Lead');
    setRefreshing(false);
  }, [fetchLeads]);

  useEffect(() => {
    if (leads && user) {
      const filtered = user.role === 'admin' 
        ? leads.filter(lead => lead.leadType === 'Lead' || !lead.leadType)
        : leads.filter(lead => 
            lead.assignedAgent === user.id && 
            (lead.leadType === 'Lead' || !lead.leadType)
          );
      setFilteredLeads(filtered);
    } else {
      setFilteredLeads([]);
    }
  }, [leads, user]);

  useFocusEffect(
    useCallback(() => {
      fetchLeads('Lead');
    }, [fetchLeads])
  );

  const handleAddLead = () => {
    if (canCreateLeads) {
      navigation.navigate('AddEditLead', { leadId: undefined });
    } else {
      Alert.alert('Permission Denied', 'You do not have permission to create leads.');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (permissionService.hasPermission(user, 'leads', 'delete')) {
      Alert.alert(
        "Delete Lead",
        "Are you sure you want to delete this lead?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: async () => {
              try {
                await deleteLead(id);
                Alert.alert("Success", "Lead deleted successfully!");
              } catch (err: any) {
                Alert.alert("Error", err.message || "Failed to delete lead.");
              }
            },
            style: "destructive",
          },
        ]
      );
    } else {
      Alert.alert('Permission Denied', 'You do not have permission to delete leads.');
    }
  };

  const getStatusColor = (status: Lead['status']) => {
    const statusColors = {
      'New': theme.colors.secondary,
      'Contacted': theme.colors.primary,
      'Qualified': theme.colors.success,
      'Nurturing': theme.colors.warning,
      'Site Visit Scheduled': theme.colors.accent,
      'Site Visited': theme.colors.primary,
      'Negotiation': theme.colors.warning,
      'Converted': theme.colors.success,
      'Lost': theme.colors.danger,
      'Hold': theme.colors.text.medium,
    };
    return statusColors[status] || theme.colors.text.medium;
  };

  const renderLeadCard = ({ item, index }: { item: Lead; index: number }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    
    React.useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    const translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    return (
      <Animated.View 
        style={[
          styles.leadCard,
          {
            opacity: animatedValue,
            transform: [{ translateY }],
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('LeadDetails', { leadId: item.id })}
          activeOpacity={0.9}
          style={styles.cardTouchable}
        >
          <LinearGradient
            colors={[theme.colors.background.card, theme.colors.background.screen]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardHeader}>
              <View style={styles.leadInfo}>
                <Text style={styles.leadName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.leadEmail} numberOfLines={1}>{item.primaryEmail}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color={theme.colors.text.medium} />
                <Text style={styles.detailText}>{item.primaryPhone}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="business-outline" size={16} color={theme.colors.text.medium} />
                <Text style={styles.detailText}>{item.propertyType}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={16} color={theme.colors.text.medium} />
                <Text style={styles.detailText}>{item.budgetRange}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color={theme.colors.text.medium} />
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.preferredLocations.join(', ') || 'No preference'}
                </Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Score:</Text>
                <View style={[
                  styles.scoreBadge,
                  { backgroundColor: item.leadScore === 'High' ? theme.colors.success : 
                                   item.leadScore === 'Medium' ? theme.colors.warning : 
                                   theme.colors.danger }
                ]}>
                  <Text style={styles.scoreText}>{item.leadScore}</Text>
                </View>
              </View>
              
              <View style={styles.actionButtons}>
                {permissionService.hasPermission(user, 'leads', 'update') && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => navigation.navigate('AddEditLead', { leadId: item.id })}
                  >
                    <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                )}
                {permissionService.hasPermission(user, 'leads', 'delete') && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteLead(item.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.screen} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your leads...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.screen} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={theme.colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            title="Try Again" 
            onPress={() => fetchLeads('Lead')} 
            icon={<Ionicons name="refresh" size={18} color={theme.colors.text.white} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.screen} />
      
      <Animated.View style={[styles.header, { opacity: headerAnimation }]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Active Leads</Text>
              <Text style={styles.headerSubtitle}>
                {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} in pipeline
              </Text>
            </View>
            {canCreateLeads && (
              <TouchableOpacity onPress={handleAddLead} style={styles.addButton}>
                <LinearGradient
                  colors={[theme.colors.accent, theme.colors.secondary]}
                  style={styles.addButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="add" size={24} color={theme.colors.text.white} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </Animated.View>

      {filteredLeads.length === 0 ? (
        <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
          <View style={styles.emptyContent}>
            <Ionicons name="people-circle-outline" size={100} color={theme.colors.text.light} />
            <Text style={styles.emptyTitle}>No Active Leads</Text>
            <Text style={styles.emptySubtitle}>
              Start building your pipeline by adding your first lead
            </Text>
            {canCreateLeads && (
              <Button 
                title="Add Your First Lead" 
                onPress={handleAddLead}
                icon={<Ionicons name="add-circle" size={20} color={theme.colors.text.white} />}
                style={styles.emptyButton}
              />
            )}
          </View>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
          <FlatList
            data={filteredLeads}
            keyExtractor={(item) => item.id}
            renderItem={renderLeadCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.screen,
  },
  header: {
    marginBottom: theme.spacing.medium,
  },
  headerGradient: {
    paddingTop: theme.spacing.medium,
    paddingBottom: theme.spacing.large,
    ...theme.shadows.medium,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.large,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.text.white + 'CC',
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.large,
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.large,
  },
  errorText: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.danger,
    marginVertical: theme.spacing.medium,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.large,
  },
  emptyContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text.dark,
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.small,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.light,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.large,
  },
  emptyButton: {
    marginTop: theme.spacing.medium,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.large,
    paddingBottom: 100, // Space for tab bar
  },
  leadCard: {
    marginBottom: theme.spacing.medium,
    borderRadius: theme.borderRadius + 4,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  cardTouchable: {
    overflow: 'hidden',
  },
  cardGradient: {
    padding: theme.spacing.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.small,
  },
  leadInfo: {
    flex: 1,
    marginRight: theme.spacing.small,
  },
  leadName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.dark,
    marginBottom: 2,
  },
  leadEmail: {
    fontSize: 14,
    color: theme.colors.text.medium,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: theme.spacing.medium,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xsmall,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text.medium,
    marginLeft: theme.spacing.small,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.small,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: theme.colors.text.medium,
    marginRight: theme.spacing.xsmall,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.white,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: theme.colors.primary + '20',
  },
  deleteButton: {
    backgroundColor: theme.colors.danger + '20',
  },
});

export default LeadsScreen;