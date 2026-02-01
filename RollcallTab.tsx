import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity,
    Modal,
    Pressable,
    FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PostCard from "@/components/rollcall/PostCard";
import {
    fetchRollcallPosts,
    postRollcallComment,
    RollcallPost,
} from "@/hooks/services/rollcallService";
import { fetchFriends, Friend } from "@/hooks/services/friendsService";
import { useTheme } from "@/context/ThemeContext";

const { height, width } = Dimensions.get("window");

interface RollcallTabProps {
    goToPage?: (page: string) => void;
}

export default function RollcallTab({ goToPage }: RollcallTabProps) {
    const [posts, setPosts] = useState<RollcallPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [friendDetails, setFriendDetails] = useState<Friend[]>([]);
    const [user, setUser] = useState<any>(null);
    const { colors } = useTheme();

    // Week selector state
    const [selectedWeek, setSelectedWeek] = useState(3); // Default to week 52
    const [selectedYear, setSelectedYear] = useState(2026);
    const [showWeekPicker, setShowWeekPicker] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    // Reload posts when week/year changes
    useEffect(() => {
        if (user) {
            loadRollcallPosts();
        }
    }, [selectedWeek, selectedYear, user]); // Added user to dependency array to ensure posts load after user is set

    const loadInitialData = async () => {
        try {
            // Load user from AsyncStorage
            const userStr = await AsyncStorage.getItem("user");
            if (userStr) {
                setUser(JSON.parse(userStr));
            }

            // Load friends
            const friends = await fetchFriends();
            setFriendDetails(friends);

            // The initial loadRollcallPosts will be triggered by the useEffect when user is set
        } catch (error) {
            console.error("Error loading initial data:", error);
        } finally {
            setLoading(false); // Set loading to false here as initial data is loaded
        }
    };

    const loadRollcallPosts = async () => {
        try {
            setLoading(true);
            const fetchedPosts = await fetchRollcallPosts(selectedWeek, selectedYear);
            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Error loading rollcall posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (
        postUid: string,
        postItemUid: string,
        body: string
    ) => {
        try {
            if (!user?.uid) {
                console.error("No user UID available");
                throw new Error("User not logged in");
            }
            await postRollcallComment(postUid, postItemUid, body, user.uid);
        } catch (error) {
            console.error("Error adding comment:", error);
            throw error;
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors["base-100"] }]}>
                <ActivityIndicator size="large" color={colors["base-content"]} />
                <Text style={[styles.loadingText, { color: colors["base-content"] }]}>Loading rollcall posts...</Text>
            </View>
        );
    }

    // Generate week options (weeks 1-53)
    const weekOptions = Array.from({ length: 52 }, (_, i) => i + 1);
    const yearOptions = [2025, 2026];

    const renderPost = ({ item }: { item: RollcallPost }) => (
        <View style={styles.postContainer}>
            <PostCard
                post={item}
                onAddComment={handleAddComment}
                friendDetails={friendDetails}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Week Selector Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.weekSelector, { backgroundColor: colors["base-200"] + "80", borderColor: colors["base-300"] }]}
                    onPress={() => setShowWeekPicker(true)}
                >
                    <Feather name="calendar" size={20} color={colors["base-content"]} />
                    <Text style={[styles.weekText, { color: colors["base-content"] }]}>
                        Week {selectedWeek}, {selectedYear}
                    </Text>
                    <Feather name="chevron-down" size={18} color={colors["base-content"]} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.refreshButton, { backgroundColor: colors["base-200"] + "80", borderColor: colors["base-300"] }]}
                    onPress={loadRollcallPosts}
                    disabled={loading}
                >
                    <Feather name="refresh-cw" size={20} color={colors["base-content"]} />
                </TouchableOpacity>
            </View>

            {/* Week Picker Modal */}
            <Modal
                visible={showWeekPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowWeekPicker(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowWeekPicker(false)}
                >
                    <View
                        style={[styles.pickerContainer, { backgroundColor: colors["base-100"] }]}
                        onStartShouldSetResponder={() => true}
                    >
                        <View style={styles.pickerHeader}>
                            <Text style={[styles.pickerTitle, { color: colors["base-content"] }]}>Select Week</Text>
                            <TouchableOpacity onPress={() => setShowWeekPicker(false)}>
                                <Feather name="x" size={24} color={colors["base-content"]} />
                            </TouchableOpacity>
                        </View>

                        {/* Year Selector */}
                        <View style={styles.yearSelector}>
                            {yearOptions.map((year) => (
                                <TouchableOpacity
                                    key={year}
                                    style={[
                                        styles.yearButton,
                                        { backgroundColor: colors["base-200"] },
                                        selectedYear === year && [styles.yearButtonActive, { backgroundColor: colors.primary }],
                                    ]}
                                    onPress={() => setSelectedYear(year)}
                                >
                                    <Text
                                        style={[
                                            styles.yearButtonText,
                                            { color: colors["base-content"] },
                                            selectedYear === year && [styles.yearButtonTextActive, { color: colors["base-100"] }],
                                        ]}
                                    >
                                        {year}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Week Grid */}
                        <FlatList
                            data={weekOptions}
                            numColumns={5}
                            keyExtractor={(item) => item.toString()}
                            renderItem={({ item: week }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.weekButton,
                                        { backgroundColor: colors["base-200"] },
                                        selectedWeek === week && [styles.weekButtonActive, { backgroundColor: colors.primary }],
                                    ]}
                                    onPress={() => {
                                        setSelectedWeek(week);
                                        setShowWeekPicker(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.weekButtonText,
                                            { color: colors["base-content"] },
                                            selectedWeek === week && [styles.weekButtonTextActive, { color: colors["base-100"] }],
                                        ]}
                                    >
                                        {week}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.weekGridInner}
                        />
                    </View>
                </Pressable>
            </Modal>

            {posts.length === 0 ? (
                <View style={[styles.emptyContainer, { backgroundColor: colors["base-100"] }]}>
                    <Text style={[styles.emptyText, { color: colors["base-content"] + "80" }]}>
                        No rollcall posts for Week {selectedWeek}, {selectedYear}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={(item) => item.uid}
                    pagingEnabled // Enable TikTok-style paging
                    showsVerticalScrollIndicator={false}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    style={styles.flatList}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#000", -> dynamic
    },
    header: {
        marginTop: 40,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        zIndex: 10,
    },
    weekSelector: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        gap: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    weekText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    refreshButton: {
        backgroundColor: "rgba(255,255,255,0.1)",
        padding: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    flatList: {
        flex: 1,
    },
    postContainer: {
        height: height - 120, // Full screen minus header
        justifyContent: "center",
        alignItems: "center",
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
    },
    loadingText: {
        color: "#fff",
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        color: "#888",
        fontSize: 16,
        textAlign: "center",
        paddingHorizontal: 40,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    pickerContainer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: height * 0.7,
        padding: 20,
    },
    pickerHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    pickerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
    },
    yearSelector: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 20,
    },
    yearButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: "#f0f0f0",
        alignItems: "center",
    },
    yearButtonActive: {
        backgroundColor: "#007AFF",
    },
    yearButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    yearButtonTextActive: {
        color: "#fff",
    },
    weekGridInner: {
        paddingBottom: 20,
    },
    weekButton: {
        width: "18%",
        aspectRatio: 1,
        backgroundColor: "#f0f0f0",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        margin: 4,
    },
    weekButtonActive: {
        backgroundColor: "#007AFF",
    },
    weekButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    weekButtonTextActive: {
        color: "#fff",
    },
});
